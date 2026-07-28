/**
 * Database types.
 *
 * Hand-authored to mirror `supabase/migrations`, because generating them
 * requires either Docker or a linked project. Once a Supabase project exists,
 * regenerate and replace this file wholesale:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 *
 * Keep the shape identical to the migrations until then — this file is the
 * single source of truth for every query in the app.
 */

export type ContentStatus = "draft" | "published";
export type UserRole = "super_admin" | "editor" | "viewer";
export type ContentLanguage = "en" | "ml";
export type DonationMethodType =
  | "upi_deeplink"
  | "qr_only"
  | "whatsapp"
  | "external_url"
  | "bank_transfer";
export type DonationIntentType = "monthly" | "annual" | "rice" | "custom";
export type DonationIntentStatus = "pending" | "confirmed" | "rejected";
export type AuditAction = "insert" | "update" | "delete";

/** Columns every content table carries. */
type Auditable = {
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type Publishable = Auditable & {
  status: ContentStatus;
  deleted_at: string | null;
  display_order: number;
};

export type Profile = Auditable & {
  id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
};

export type Media = Auditable & {
  id: string;
  bucket: string;
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  blurhash: string | null;
  alt_text: string;
  alt_text_ml: string | null;
  folder: string;
};

export type SiteSettings = Auditable & {
  id: boolean;
  site_name: string;
  tagline: string | null;
  description: string | null;
  logo_light_media_id: string | null;
  logo_dark_media_id: string | null;
  favicon_media_id: string | null;
  default_og_media_id: string | null;
  maintenance_mode: boolean;
};

export type HeroSlide = Publishable & {
  id: string;
  heading: string;
  subheading: string | null;
  eyebrow: string | null;
  media_id: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
};

export type PageSection = Publishable & {
  id: string;
  page_slug: string;
  section_key: string;
  title: string | null;
  title_ml: string | null;
  subtitle: string | null;
  body: string | null;
  body_ml: string | null;
  media_id: string | null;
};

export type Statistic = Publishable & {
  id: string;
  label: string;
  value: number;
  suffix: string | null;
  number_format: "grouped" | "plain";
  icon: string | null;
};

export type CoreAmbition = Publishable & {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
};

export type Department = Publishable & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  head_name: string | null;
  icon: string | null;
  media_id: string | null;
};

export type Faculty = Publishable & {
  id: string;
  name: string;
  slug: string;
  designation: string;
  qualification: string;
  department_id: string | null;
  photo_media_id: string | null;
  biography: string | null;
  biography_ml: string | null;
};

export type Facility = Publishable & {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  media_id: string | null;
};

export type Skill = Publishable & {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  media_id: string | null;
};

export type TimelineEvent = Publishable & {
  id: string;
  year: number | null;
  event_date: string | null;
  title: string;
  title_ml: string | null;
  description: string | null;
  description_ml: string | null;
  media_id: string | null;
};

export type AchievementCategory = Publishable & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export type Achievement = Publishable & {
  id: string;
  title: string;
  title_ml: string | null;
  description: string | null;
  description_ml: string | null;
  icon: string | null;
  media_id: string | null;
  category_id: string | null;
  year: number | null;
  is_featured: boolean;
};

export type NewsCategory = Publishable & {
  id: string;
  name: string;
  name_ml: string | null;
  slug: string;
};

/** Tiptap / ProseMirror document. Stored as JSON, never HTML. */
export type RichTextDocument = {
  type: string;
  content?: RichTextDocument[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
};

export type NewsPost = Publishable & {
  id: string;
  slug: string;
  title: string | null;
  excerpt: string | null;
  body: RichTextDocument | null;
  title_ml: string | null;
  excerpt_ml: string | null;
  body_ml: RichTextDocument | null;
  primary_language: ContentLanguage;
  cover_media_id: string | null;
  category_id: string | null;
  is_featured: boolean;
  views: number;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  search_text: string | null;
};

export type GalleryCategory = Publishable & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type GalleryItem = Publishable & {
  id: string;
  media_id: string;
  category_id: string | null;
  caption: string | null;
  caption_ml: string | null;
  taken_at: string | null;
  is_featured: boolean;
};

export type SponsorshipPlan = Publishable & {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: "monthly" | "annual" | "one_time";
  description: string | null;
  description_ml: string | null;
  icon: string | null;
  illustration_media_id: string | null;
  benefits: string[];
  is_featured: boolean;
};

export type SponsorshipProvide = Publishable & {
  id: string;
  label: string;
  label_ml: string | null;
  icon: string | null;
};

/** Per-type shape of `donation_methods.config`. */
export type DonationConfig = {
  upi_deeplink: {
    upi_id: string;
    payee_name: string;
    bank_name?: string;
    qr_media_id: string;
    default_amount?: number;
    note?: string;
  };
  qr_only: {
    qr_media_id: string;
    account_holder_name: string;
    bank_name?: string;
    upi_id?: string;
  };
  whatsapp: {
    phone_e164: string;
    prefilled_message_template?: string;
  };
  external_url: {
    url: string;
    button_label?: string;
    opens_in_new_tab?: boolean;
  };
  bank_transfer: {
    account_holder_name: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
    branch?: string;
    qr_media_id?: string;
  };
};

/**
 * Discriminated union over the method type, so the modal's renderer for each
 * type gets a precisely typed config with no casting.
 */
export type DonationMethod = {
  [K in DonationMethodType]: Auditable & {
    id: string;
    type: K;
    label: string;
    config: DonationConfig[K];
    display_note: string | null;
    is_active: boolean;
  };
}[DonationMethodType];

/**
 * Storage shape of a donation method.
 *
 * `config` is a jsonb column, so the table type keeps it loose. The
 * discriminated `DonationMethod` above is an application-level refinement used
 * when reading — a union cannot be used for writes, because `Partial<union>`
 * collapses to the first member and rejects valid inserts.
 */
export type DonationMethodRecord = Auditable & {
  id: string;
  type: DonationMethodType;
  label: string;
  config: Record<string, unknown>;
  display_note: string | null;
  is_active: boolean;
};

export type RiceDonation = Auditable & {
  id: boolean;
  title: string;
  quantity_kg: number;
  description: string | null;
  description_ml: string | null;
  illustration_media_id: string | null;
  is_active: boolean;
};

export type DonationIntent = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  amount: number | null;
  plan_id: string | null;
  type: DonationIntentType;
  message: string | null;
  status: DonationIntentStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactInfo = Auditable & {
  id: boolean;
  address: string | null;
  address_ml: string | null;
  phones: string[];
  emails: string[];
  map_lat: number | null;
  map_lng: number | null;
  map_embed_url: string | null;
  office_hours: string | null;
  social_links: Record<string, string>;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: number;
  actor_id: string | null;
  action: AuditAction;
  table_name: string;
  record_id: string | null;
  diff: Record<string, unknown> | null;
  created_at: string;
};

/**
 * Row / Insert / Update triple in the shape supabase-js expects.
 *
 * `Insert` is `Partial<Row>` because TypeScript cannot see which columns carry
 * database defaults (`status`, `display_order`, `bucket`, the audit columns are
 * all filled by defaults or triggers), and requiring them would reject valid
 * inserts. NOT NULL constraints still enforce the real requirements at write
 * time, and `supabase gen types` restores exact per-column optionality once a
 * project is linked.
 */
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      media: Table<Media>;
      site_settings: Table<SiteSettings>;
      hero_slides: Table<HeroSlide>;
      page_sections: Table<PageSection>;
      statistics: Table<Statistic>;
      core_ambitions: Table<CoreAmbition>;
      departments: Table<Department>;
      faculty: Table<Faculty>;
      facilities: Table<Facility>;
      skills: Table<Skill>;
      timeline_events: Table<TimelineEvent>;
      achievement_categories: Table<AchievementCategory>;
      achievements: Table<Achievement>;
      news_categories: Table<NewsCategory>;
      news_posts: Table<NewsPost>;
      gallery_categories: Table<GalleryCategory>;
      gallery_items: Table<GalleryItem>;
      sponsorship_plans: Table<SponsorshipPlan>;
      sponsorship_provides: Table<SponsorshipProvide>;
      donation_methods: Table<DonationMethodRecord>;
      rice_donation: Table<RiceDonation>;
      donation_intents: Table<DonationIntent>;
      contact_info: Table<ContactInfo>;
      contact_messages: Table<ContactMessage>;
      audit_logs: Table<AuditLog>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      content_status: ContentStatus;
      user_role: UserRole;
      content_language: ContentLanguage;
      donation_method_type: DonationMethodType;
      donation_intent_type: DonationIntentType;
      donation_intent_status: DonationIntentStatus;
      audit_action: AuditAction;
    };
    CompositeTypes: Record<never, never>;
  };
};
