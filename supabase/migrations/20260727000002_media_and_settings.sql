-- ============================================================================
-- 0002 — Media library, storage buckets, site settings
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Media — every image in the system is a row here, never a bare storage path.
-- This is what makes alt text enforceable and blurhash placeholders possible.
-- ---------------------------------------------------------------------------

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'public-media',
  storage_path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint,
  width integer,
  height integer,
  blurhash text,
  -- Alt text is NOT NULL by design. Decorative images pass an empty string
  -- explicitly, which is a deliberate choice rather than an omission.
  alt_text text not null,
  alt_text_ml text,
  folder text not null default 'general',
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, storage_path)
);

create index media_folder_idx on public.media (folder, created_at desc);
create index media_filename_trgm_idx on public.media using gin (filename extensions.gin_trgm_ops);

select public.attach_content_triggers('public.media');

alter table public.media enable row level security;

-- Media rows are public: an image referenced by any published row must be
-- readable, and the storage objects themselves are public anyway.
create policy "media readable by everyone"
  on public.media for select
  to anon, authenticated
  using (true);

create policy "media managed by admins"
  on public.media for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 20971520,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  -- Separate bucket: the donation QR is the highest-risk asset in the system
  -- and deserves its own audit surface and access policy.
  ('qr-codes', 'qr-codes', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('documents', 'documents', true, 20971520,
   array['application/pdf'])
on conflict (id) do nothing;

create policy "storage public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('public-media', 'qr-codes', 'documents'));

create policy "storage admin write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('public-media', 'qr-codes', 'documents') and public.is_admin()
  );

create policy "storage admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('public-media', 'qr-codes', 'documents') and public.is_admin());

create policy "storage admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('public-media', 'qr-codes', 'documents') and public.is_admin());

-- ---------------------------------------------------------------------------
-- Site settings — a true singleton.
--
-- The `id boolean primary key default true check (id)` pattern makes a second
-- row impossible at the database level rather than by convention.
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'KMO Islamic Academy',
  tagline text,
  description text,
  logo_light_media_id uuid references public.media (id) on delete set null,
  logo_dark_media_id uuid references public.media (id) on delete set null,
  favicon_media_id uuid references public.media (id) on delete set null,
  default_og_media_id uuid references public.media (id) on delete set null,
  maintenance_mode boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

select public.attach_content_triggers('public.site_settings');

alter table public.site_settings enable row level security;

create policy "settings readable by everyone"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Site-wide settings are a super-admin concern, not an editor one.
create policy "settings managed by super admins"
  on public.site_settings for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
