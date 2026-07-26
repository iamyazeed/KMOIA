-- ============================================================================
-- 0004 — News (English / Malayalam) and Gallery
-- ============================================================================

-- ---------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------

create table public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ml text,
  slug text not null unique,
  display_order integer not null default 0,
  status public.content_status not null default 'published',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,

  -- English fields
  title text,
  excerpt text,
  -- Tiptap ProseMirror JSON, never HTML: safe to render without
  -- dangerouslySetInnerHTML and stable across future redesigns.
  body jsonb,

  -- Malayalam fields. Written by the admin, never machine-translated.
  title_ml text,
  excerpt_ml text,
  body_ml jsonb,

  -- Which language this article was actually written in. Drives lang="ml",
  -- Malayalam typography, and correct indexing by search engines.
  primary_language public.content_language not null default 'en',

  cover_media_id uuid references public.media (id) on delete set null,
  category_id uuid references public.news_categories (id) on delete set null,
  is_featured boolean not null default false,
  views integer not null default 0,
  published_at timestamptz,
  meta_title text,
  meta_description text,

  -- Plain text extracted from whichever language body is present, maintained
  -- by a trigger and used for full-text search.
  search_text text,

  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- An article must carry a title in the language it claims to be written in.
  constraint news_has_title_in_primary_language check (
    (primary_language = 'en' and title is not null)
    or (primary_language = 'ml' and title_ml is not null)
  ),
  -- Published articles must have a publication date.
  constraint news_published_has_date check (
    status <> 'published' or published_at is not null
  )
);

create index news_published_idx
  on public.news_posts (published_at desc)
  where status = 'published' and deleted_at is null;

create index news_category_idx on public.news_posts (category_id, published_at desc);

create index news_search_idx
  on public.news_posts using gin (search_text extensions.gin_trgm_ops);

-- Flattens Tiptap JSON to plain text so both English and Malayalam articles
-- are searchable. Malayalam has no Postgres FTS dictionary, which is why this
-- uses trigram search rather than tsvector.
create or replace function public.extract_prosemirror_text(doc jsonb)
returns text
language sql
immutable
as $$
  select coalesce(string_agg(node #>> '{}', ' '), '')
  from jsonb_path_query(coalesce(doc, '{}'::jsonb), '$.**.text') as node;
$$;

create or replace function public.news_update_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text :=
    concat_ws(' ',
      new.title, new.excerpt, public.extract_prosemirror_text(new.body),
      new.title_ml, new.excerpt_ml, public.extract_prosemirror_text(new.body_ml)
    );
  return new;
end;
$$;

create trigger news_posts_search_text
  before insert or update on public.news_posts
  for each row execute function public.news_update_search_text();

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------

create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  status public.content_status not null default 'published',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  -- CASCADE here is correct: a gallery item without its image is meaningless.
  media_id uuid not null references public.media (id) on delete cascade,
  category_id uuid references public.gallery_categories (id) on delete set null,
  caption text,
  caption_ml text,
  taken_at date,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  status public.content_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_listing_idx
  on public.gallery_items (category_id, display_order)
  where status = 'published' and deleted_at is null;

create index gallery_featured_idx
  on public.gallery_items (display_order)
  where is_featured and status = 'published' and deleted_at is null;

-- ---------------------------------------------------------------------------
-- Triggers & policies
-- ---------------------------------------------------------------------------

select public.attach_content_triggers(t) from unnest(array[
  'public.news_categories'::regclass,
  'public.news_posts'::regclass,
  'public.gallery_categories'::regclass,
  'public.gallery_items'::regclass
]) as t;

select public.attach_content_policies(t) from unnest(array[
  'public.news_categories'::regclass,
  'public.news_posts'::regclass,
  'public.gallery_categories'::regclass,
  'public.gallery_items'::regclass
]) as t;

-- News needs a stricter public rule than the shared one: an article scheduled
-- for a future date must stay invisible until that moment, enforced in the
-- database rather than relying on every query remembering the filter.
drop policy "news_posts public read" on public.news_posts;

create policy "news_posts public read"
  on public.news_posts for select
  to anon, authenticated
  using (
    status = 'published'
    and deleted_at is null
    and published_at is not null
    and published_at <= now()
  );
