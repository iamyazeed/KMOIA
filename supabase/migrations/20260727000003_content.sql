-- ============================================================================
-- 0003 — Institutional content: homepage, academics, faculty, achievements
-- ============================================================================

-- Applies the standard public/admin policy pair. Every content table uses it,
-- so a new table cannot accidentally ship with weaker rules than the rest.
-- Assumes the table has `status` and `deleted_at` columns.
create or replace function public.attach_content_policies(target regclass)
returns void
language plpgsql
as $$
declare
  t text := target::text;
  n text := replace(replace(t, 'public.', ''), '"', '');
begin
  execute format('alter table %s enable row level security', t);

  execute format(
    'create policy %I on %s for select to anon, authenticated
       using (status = ''published'' and deleted_at is null)',
    n || ' public read', t
  );

  -- Staff see drafts and soft-deleted rows so the admin panel can list them.
  execute format(
    'create policy %I on %s for select to authenticated using (public.is_staff())',
    n || ' staff read', t
  );

  execute format(
    'create policy %I on %s for all to authenticated
       using (public.is_admin()) with check (public.is_admin())',
    n || ' admin write', t
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Hero slides
-- ---------------------------------------------------------------------------

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  heading text not null,
  subheading text,
  eyebrow text,
  media_id uuid references public.media (id) on delete set null,
  cta_label text,
  cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hero_slides_order_idx
  on public.hero_slides (display_order) where status = 'published' and deleted_at is null;

-- ---------------------------------------------------------------------------
-- Page sections — generic editable text blocks, keyed by page + section.
-- Used for About preview, Vision, Mission, Legacy prose and similar copy the
-- committee edits but whose layout is fixed in code.
-- ---------------------------------------------------------------------------

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  title text,
  title_ml text,
  subtitle text,
  body text,
  body_ml text,
  media_id uuid references public.media (id) on delete set null,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_slug, section_key)
);

create index page_sections_page_idx on public.page_sections (page_slug, display_order);

-- ---------------------------------------------------------------------------
-- Statistics & core ambitions
-- ---------------------------------------------------------------------------

create table public.statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value numeric not null,
  suffix text,
  -- 'plain' suppresses thousands separators, e.g. for a year.
  number_format text not null default 'grouped'
    check (number_format in ('grouped', 'plain')),
  icon text,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.core_ambitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Departments & faculty
-- ---------------------------------------------------------------------------

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  head_name text,
  icon text,
  media_id uuid references public.media (id) on delete set null,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faculty (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  designation text not null,
  qualification text not null,
  -- SET NULL, never CASCADE: deleting a department must never silently delete
  -- the scholars who taught in it. They fall into an "Unassigned" bucket.
  department_id uuid references public.departments (id) on delete set null,
  photo_media_id uuid references public.media (id) on delete set null,
  biography text,
  biography_ml text,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.faculty.deleted_at is
  'Soft delete. Removing a senior scholar by mis-click must be recoverable; the admin Trash view restores within 30 days.';

create index faculty_listing_idx
  on public.faculty (department_id, display_order)
  where status = 'published' and deleted_at is null;

create index departments_order_idx on public.departments (display_order);

-- ---------------------------------------------------------------------------
-- Campus life: facilities & student skills
-- ---------------------------------------------------------------------------

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  media_id uuid references public.media (id) on delete set null,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  media_id uuid references public.media (id) on delete set null,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.skills is
  'Student Excellence: graphic design, video editing, 3D modelling, cyber security, languages.';

-- ---------------------------------------------------------------------------
-- Legacy timeline
-- ---------------------------------------------------------------------------

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  year integer,
  event_date date,
  title text not null,
  title_ml text,
  description text,
  description_ml text,
  media_id uuid references public.media (id) on delete set null,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index timeline_order_idx on public.timeline_events (display_order, year);

-- ---------------------------------------------------------------------------
-- Achievements — one page, admin-managed categories.
--
-- Categories are a table rather than an enum so renaming or adding one is a
-- committee action, not a migration.
-- ---------------------------------------------------------------------------

create table public.achievement_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  display_order integer not null default 0,
  status public.content_status not null default 'published',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ml text,
  description text,
  description_ml text,
  icon text,
  media_id uuid references public.media (id) on delete set null,
  category_id uuid references public.achievement_categories (id) on delete set null,
  year integer,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index achievements_category_idx
  on public.achievements (category_id, display_order)
  where status = 'published' and deleted_at is null;

create index achievements_featured_idx
  on public.achievements (display_order)
  where is_featured and status = 'published' and deleted_at is null;

-- ---------------------------------------------------------------------------
-- Triggers & policies
-- ---------------------------------------------------------------------------

select public.attach_content_triggers(t) from unnest(array[
  'public.hero_slides'::regclass,
  'public.page_sections'::regclass,
  'public.statistics'::regclass,
  'public.core_ambitions'::regclass,
  'public.departments'::regclass,
  'public.faculty'::regclass,
  'public.facilities'::regclass,
  'public.skills'::regclass,
  'public.timeline_events'::regclass,
  'public.achievement_categories'::regclass,
  'public.achievements'::regclass
]) as t;

select public.attach_content_policies(t) from unnest(array[
  'public.hero_slides'::regclass,
  'public.page_sections'::regclass,
  'public.statistics'::regclass,
  'public.core_ambitions'::regclass,
  'public.departments'::regclass,
  'public.faculty'::regclass,
  'public.facilities'::regclass,
  'public.skills'::regclass,
  'public.timeline_events'::regclass,
  'public.achievement_categories'::regclass,
  'public.achievements'::regclass
]) as t;
