-- ============================================================================
-- 0006 — Contact information and enquiry inbox
-- ============================================================================

create table public.contact_info (
  id boolean primary key default true check (id),
  address text,
  address_ml text,
  phones text[] not null default '{}',
  emails text[] not null default '{}',
  map_lat numeric(9, 6),
  map_lng numeric(9, 6),
  map_embed_url text,
  office_hours text,
  -- {"instagram": "https://…", "youtube": "…", "facebook": "…"}
  social_links jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  submitted_ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_message_has_contact check (
    email is not null or phone is not null
  )
);

create index contact_messages_inbox_idx
  on public.contact_messages (created_at desc)
  where not is_archived;

create index contact_messages_unread_idx
  on public.contact_messages (created_at desc)
  where not is_read and not is_archived;

select public.attach_content_triggers('public.contact_info');

create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

alter table public.contact_info enable row level security;

create policy "contact info public read"
  on public.contact_info for select
  to anon, authenticated
  using (true);

create policy "contact info managed by admins"
  on public.contact_info for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.contact_messages enable row level security;

-- Anyone may write to the academy; only staff may read the inbox.
create policy "contact messages public submit"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "contact messages staff read"
  on public.contact_messages for select
  to authenticated
  using (public.is_staff());

create policy "contact messages managed by admins"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact messages deleted by super admins"
  on public.contact_messages for delete
  to authenticated
  using (public.is_super_admin());
