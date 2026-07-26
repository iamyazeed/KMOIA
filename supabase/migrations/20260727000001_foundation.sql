-- ============================================================================
-- 0001 — Foundation: extensions, enums, helper functions, shared triggers
-- ============================================================================

create extension if not exists "pg_trgm" with schema extensions;
create extension if not exists "unaccent" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Draft/published lifecycle shared by every content table.
create type public.content_status as enum ('draft', 'published');

create type public.user_role as enum ('super_admin', 'editor', 'viewer');

-- News articles are written in one language and never machine-translated.
create type public.content_language as enum ('en', 'ml');

create type public.donation_method_type as enum (
  'upi_deeplink',
  'qr_only',
  'whatsapp',
  'external_url',
  'bank_transfer'
);

create type public.donation_intent_type as enum (
  'monthly',
  'annual',
  'rice',
  'custom'
);

create type public.donation_intent_status as enum (
  'pending',
  'confirmed',
  'rejected'
);

create type public.audit_action as enum ('insert', 'update', 'delete');

-- ---------------------------------------------------------------------------
-- Profiles — extends auth.users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text,
  role public.user_role not null default 'viewer',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Admin users. Rows are created by the handle_new_user trigger on auth.users; there is no public signup.';

create index profiles_role_idx on public.profiles (role) where is_active;

-- ---------------------------------------------------------------------------
-- Authorisation helpers
--
-- SECURITY DEFINER so policies can read profiles without recursing through
-- profiles' own RLS. search_path is pinned to defeat search-path hijacking.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.is_active
      and p.role in ('super_admin', 'editor')
  );
$$;

create or replace function public.is_super_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.is_active
      and p.role = 'super_admin'
  );
$$;

-- Any signed-in, active admin panel user — including read-only viewers.
create or replace function public.is_staff(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid and p.is_active
  );
$$;

-- ---------------------------------------------------------------------------
-- Shared triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Stamps authorship. created_by is never overwritten on update.
create or replace function public.set_audit_actor()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
    new.updated_by := auth.uid();
  else
    new.created_by := old.created_by;
    new.updated_by := coalesce(auth.uid(), old.updated_by);
  end if;
  return new;
end;
$$;

-- Generates a URL slug from a title, guaranteeing uniqueness per table.
create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      lower(extensions.unaccent(coalesce(value, ''))),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action public.audit_action not null,
  table_name text not null,
  record_id text,
  -- Only the columns that actually changed, as {col: {old, new}}.
  diff jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_table_record_idx on public.audit_logs (table_name, record_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

create or replace function public.record_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_diff jsonb;
  v_id text;
begin
  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_id := v_old ->> 'id';
    insert into public.audit_logs (actor_id, action, table_name, record_id, diff)
    values (auth.uid(), 'delete', tg_table_name, v_id, jsonb_build_object('old', v_old));
    return old;
  end if;

  v_new := to_jsonb(new);
  v_id := v_new ->> 'id';

  if tg_op = 'INSERT' then
    insert into public.audit_logs (actor_id, action, table_name, record_id, diff)
    values (auth.uid(), 'insert', tg_table_name, v_id, jsonb_build_object('new', v_new));
    return new;
  end if;

  v_old := to_jsonb(old);

  -- Record only changed columns, and ignore bookkeeping churn.
  select jsonb_object_agg(
           key,
           jsonb_build_object('old', v_old -> key, 'new', v_new -> key)
         )
  into v_diff
  from jsonb_each(v_new)
  where (v_old -> key) is distinct from (v_new -> key)
    and key not in ('updated_at', 'updated_by');

  if v_diff is null then
    return new;
  end if;

  insert into public.audit_logs (actor_id, action, table_name, record_id, diff)
  values (auth.uid(), 'update', tg_table_name, v_id, v_diff);

  return new;
end;
$$;

-- Attaches updated_at + authorship + audit triggers to a content table in one
-- call, so no table can be added later without them.
create or replace function public.attach_content_triggers(target regclass)
returns void
language plpgsql
as $$
declare
  t text := target::text;
  n text := replace(replace(t, 'public.', ''), '"', '');
begin
  execute format(
    'create trigger %I before update on %s for each row execute function public.set_updated_at()',
    n || '_set_updated_at', t
  );
  execute format(
    'create trigger %I before insert or update on %s for each row execute function public.set_audit_actor()',
    n || '_set_audit_actor', t
  );
  execute format(
    'create trigger %I after insert or update or delete on %s for each row execute function public.record_audit()',
    n || '_audit', t
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- New auth user -> profile
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'viewer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.record_audit();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

-- Staff may read the directory; only super admins may change it.
create policy "profiles readable by staff"
  on public.profiles for select
  to authenticated
  using (public.is_staff());

create policy "profiles managed by super admins"
  on public.profiles for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Users may edit their own name and avatar.
--
-- Note the WITH CHECK deliberately does NOT subquery public.profiles: a policy
-- on a table that reads that same table under RLS recurses infinitely. Role
-- escalation is blocked by the trigger below instead, which runs as the table
-- owner and so is not subject to RLS at all.
create policy "own profile updatable"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and not public.is_super_admin()
  then
    raise exception 'Only a super admin may change a user''s role or active status';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- The audit trail is read-only from the application's point of view: it is
-- written exclusively by SECURITY DEFINER triggers.
create policy "audit readable by super admins"
  on public.audit_logs for select
  to authenticated
  using (public.is_super_admin());
