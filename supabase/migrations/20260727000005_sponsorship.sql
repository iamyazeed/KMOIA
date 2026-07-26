-- ============================================================================
-- 0005 — Sponsorship: plans, donation methods, rice donation, intents
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Sponsorship plans (Monthly ₹3,000 / Annual ₹33,000)
-- ---------------------------------------------------------------------------

create table public.sponsorship_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  period text not null check (period in ('monthly', 'annual', 'one_time')),
  description text,
  description_ml text,
  icon text,
  illustration_media_id uuid references public.media (id) on delete set null,
  benefits text[] not null default '{}',
  is_featured boolean not null default false,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Donation methods — configurable, never hardcoded.
--
-- One row per configured method; exactly one may be active. The shape of
-- `config` is validated per type by a check constraint here and by a matching
-- zod schema in the application, so a malformed method cannot be saved.
-- ---------------------------------------------------------------------------

create table public.donation_methods (
  id uuid primary key default gen_random_uuid(),
  type public.donation_method_type not null,
  label text not null,
  config jsonb not null default '{}'::jsonb,
  -- Optional line shown to donors, e.g. "Please mention your name in remarks".
  display_note text,
  is_active boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint donation_config_valid check (
    case type
      when 'upi_deeplink' then
        config ? 'upi_id' and config ? 'payee_name' and config ? 'qr_media_id'
      when 'qr_only' then
        config ? 'qr_media_id' and config ? 'account_holder_name'
      when 'whatsapp' then
        config ? 'phone_e164'
      when 'external_url' then
        config ? 'url'
      when 'bank_transfer' then
        config ? 'account_holder_name' and config ? 'account_number'
          and config ? 'ifsc' and config ? 'bank_name'
    end
  )
);

-- Exactly one active method, guaranteed by the database rather than by
-- application logic that a future contributor could forget.
create unique index donation_methods_single_active_idx
  on public.donation_methods (is_active)
  where is_active;

comment on table public.donation_methods is
  'Donation delivery configuration. Changing the active method is the highest-risk edit in the system: a wrong UPI ID silently redirects donations. Every change is audit-logged.';

-- ---------------------------------------------------------------------------
-- Rice donation — a single card, singleton row.
-- ---------------------------------------------------------------------------

create table public.rice_donation (
  id boolean primary key default true check (id),
  title text not null default 'Rice',
  quantity_kg integer not null default 25 check (quantity_kg > 0),
  description text,
  description_ml text,
  illustration_media_id uuid references public.media (id) on delete set null,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sponsorship provides — deliberately capped at three (Education, Food, Books)
-- ---------------------------------------------------------------------------

create table public.sponsorship_provides (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  label_ml text,
  icon text,
  display_order integer not null default 0,
  status public.content_status not null default 'published',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The brief says keep this minimal: Education, Food, Books, nothing else.
-- Enforced here so the constraint survives future committees, not just the
-- current admin UI.
create or replace function public.enforce_provides_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.sponsorship_provides where deleted_at is null) > 3 then
    raise exception 'Sponsorship Provides is limited to three items by design';
  end if;
  return null;
end;
$$;

create constraint trigger sponsorship_provides_limit
  after insert or update on public.sponsorship_provides
  deferrable initially deferred
  for each row execute function public.enforce_provides_limit();

-- ---------------------------------------------------------------------------
-- Donation intents — optional "I've sent it" capture.
--
-- No money passes through this system. Without this table the committee has no
-- way to know a donation happened, thank the donor, or issue a receipt.
-- The public form ships disabled and is switched on from Site Settings.
-- ---------------------------------------------------------------------------

create table public.donation_intents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  amount numeric(12, 2) check (amount is null or amount > 0),
  plan_id uuid references public.sponsorship_plans (id) on delete set null,
  type public.donation_intent_type not null default 'custom',
  message text,
  status public.donation_intent_status not null default 'pending',
  admin_notes text,
  -- Spam mitigation support.
  submitted_ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donation_intent_has_contact check (
    phone is not null or email is not null
  )
);

create index donation_intents_status_idx
  on public.donation_intents (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers & policies
-- ---------------------------------------------------------------------------

select public.attach_content_triggers(t) from unnest(array[
  'public.sponsorship_plans'::regclass,
  'public.sponsorship_provides'::regclass,
  'public.donation_methods'::regclass,
  'public.rice_donation'::regclass
]) as t;

-- Donation intents are submitted by the public, so they carry no created_by /
-- updated_by authorship and only need the updated_at stamp.
create trigger donation_intents_set_updated_at
  before update on public.donation_intents
  for each row execute function public.set_updated_at();

select public.attach_content_policies(t) from unnest(array[
  'public.sponsorship_plans'::regclass,
  'public.sponsorship_provides'::regclass
]) as t;

-- Donation methods: the active one must be publicly readable (the modal needs
-- it), but inactive configurations — old UPI IDs, unused bank details — stay
-- private to staff.
alter table public.donation_methods enable row level security;

create policy "active donation method public read"
  on public.donation_methods for select
  to anon, authenticated
  using (is_active);

create policy "donation methods staff read"
  on public.donation_methods for select
  to authenticated
  using (public.is_staff());

create policy "donation methods managed by admins"
  on public.donation_methods for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.rice_donation enable row level security;

create policy "rice donation public read"
  on public.rice_donation for select
  to anon, authenticated
  using (true);

create policy "rice donation managed by admins"
  on public.rice_donation for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Donation intents: anyone may submit one, nobody but staff may read them.
alter table public.donation_intents enable row level security;

create policy "donation intents public submit"
  on public.donation_intents for insert
  to anon, authenticated
  with check (true);

create policy "donation intents staff read"
  on public.donation_intents for select
  to authenticated
  using (public.is_staff());

create policy "donation intents managed by admins"
  on public.donation_intents for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "donation intents deleted by super admins"
  on public.donation_intents for delete
  to authenticated
  using (public.is_super_admin());
