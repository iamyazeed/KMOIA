-- ============================================================================
-- Seed — structural content the site needs to render on first boot.
--
-- Categories, plans and singleton rows only. Real copy, photographs and the
-- donation configuration are entered by the committee through the admin panel.
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

insert into public.site_settings (id, site_name, tagline, description)
values (
  true,
  'KMO Islamic Academy',
  'Teaching · Nurturing · Islamic Propagation',
  'KMO Islamic Academy Koduvally — a residential Islamic academy affiliated to Darul Huda Islamic University, managed by KMO Koduvally Orphanage.'
)
on conflict (id) do nothing;

insert into public.contact_info (id, office_hours)
values (true, 'Monday – Saturday, 9:00 AM – 5:00 PM')
on conflict (id) do nothing;

insert into public.rice_donation (id, title, quantity_kg, description)
values (
  true,
  'Rice',
  25,
  'Support students by donating 25 KG of rice for the academy kitchen.'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Achievements — the five categories, one combined page
-- ---------------------------------------------------------------------------

insert into public.achievement_categories (name, slug, display_order, status) values
  ('Institutional Achievements', 'institutional', 1, 'published'),
  ('Academic Excellence',        'academic',      2, 'published'),
  ('Student Excellence',         'student',       3, 'published'),
  ('Infrastructure',             'infrastructure',4, 'published'),
  ('Milestones',                 'milestones',    5, 'published')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- News & gallery categories
-- ---------------------------------------------------------------------------

insert into public.news_categories (name, slug, display_order, status) values
  ('Announcements', 'announcements', 1, 'published'),
  ('Events',        'events',        2, 'published'),
  ('Academics',     'academics',     3, 'published'),
  ('Achievements',  'achievements',  4, 'published')
on conflict (slug) do nothing;

insert into public.gallery_categories (name, slug, display_order, status) values
  ('Campus',       'campus',       1, 'published'),
  ('Academics',    'academics',    2, 'published'),
  ('Events',       'events',       3, 'published'),
  ('Student Life', 'student-life', 4, 'published')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Sponsorship
-- ---------------------------------------------------------------------------

insert into public.sponsorship_plans
  (name, amount, period, description, display_order, is_featured, status)
values
  ('Monthly Sponsorship', 3000, 'monthly',
   'Cover one student''s education, food and accommodation for a month.',
   1, true, 'published'),
  ('Annual Sponsorship', 33000, 'annual',
   'Carry one student through a full academic year of learning and care.',
   2, false, 'published')
on conflict do nothing;

-- Capped at three by a database trigger; this is the complete list.
insert into public.sponsorship_provides (label, icon, display_order, status) values
  ('Education', 'graduation-cap', 1, 'published'),
  ('Food',      'utensils',       2, 'published'),
  ('Books',     'book-open',      3, 'published')
on conflict do nothing;

-- No donation_methods row is seeded on purpose: the UPI ID, payee name and QR
-- code are real financial details and must be entered by an administrator.

-- ---------------------------------------------------------------------------
-- Homepage statistics
-- ---------------------------------------------------------------------------

insert into public.statistics (label, value, suffix, number_format, display_order, status) values
  ('Residential students', 240,  '+',  'grouped', 1, 'published'),
  ('Darul Huda branches',  28,   null, 'grouped', 2, 'published'),
  ('Established',          2015, null, 'plain',   3, 'published'),
  ('Free of cost',         100,  '%',  'grouped', 4, 'published')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- The three founding missions
-- ---------------------------------------------------------------------------

insert into public.core_ambitions (title, description, icon, display_order, status) values
  ('Teaching', 'A rigorous Islamic and academic curriculum delivered under the Darul Huda Islamic University framework.', 'book-open', 1, 'published'),
  ('Nurturing', 'A residential community where character, discipline and confidence are cultivated alongside scholarship.', 'heart', 2, 'published'),
  ('Islamic Propagation', 'Preparing scholars who carry knowledge outward — to serve, guide and strengthen their communities.', 'star', 3, 'published')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Legacy timeline — the founding facts
-- ---------------------------------------------------------------------------

insert into public.timeline_events (year, title, description, display_order, status) values
  (2015, 'Academy Established',
   'KMO Islamic Academy was established on 1 August 2015 under the KMO Koduvally Orphanage, made possible through the invaluable efforts of Vavad Kunji Koya Musliyar.',
   1, 'published')
on conflict do nothing;
