# KMO Islamic Academy — Project Conventions

Official website of KMO Islamic Academy Koduvally (Boys). Next.js App Router +
TypeScript + Tailwind v4 + Supabase, deployed on Vercel.

## Non-negotiable rules

1. **Structured content, fixed design.** The admin panel edits *values* (text,
   images, order, published state) — never layout. Committee members maintain
   this site; they must not be able to break it.
2. **Server Components by default.** `"use client"` only for interactivity:
   theme toggle, mobile nav, lightbox, donation modal, forms, motion wrappers,
   and the entire admin panel.
3. **Sections never fetch.** Pages fetch and pass data down as props. Only the
   `app/` layer touches Supabase.
4. **No hardcoded colours, sizes or fonts.** Everything comes from the tokens in
   `src/app/globals.css`.
5. **Glassmorphism in exactly three places:** sticky header, donation modal,
   gallery lightbox. Nowhere else — it is what dates a design.
6. **Alt text is mandatory** at the data layer (`media.alt_text`), not by
   convention. This is how WCAG AA survives ten years of committee edits.
7. **No machine translation, ever.** Malayalam is written by the admin and
   rendered as-is with `lang="ml"`. Only News may be Malayalam.
8. **Motion is restrained.** 200–500ms, ease `[0.22, 1, 0.36, 1]`, no parallax,
   no scroll-jacking, nothing animated above the fold. Always honour
   `prefers-reduced-motion`.

## Structure

```
src/
  app/(public)/   public site — header/footer layout
  app/(admin)/    admin panel — separate layout and bundle  [Phase 2]
  components/ui/       primitives (no data)
  components/layout/   header, footer, nav, logo
  components/motion/   Reveal, Stagger, Counter, MotionProvider
  components/sections/ page sections (props only)           [Phase 3]
  config/site.ts       navigation and institutional constants
  lib/fonts.ts         Fraunces (display) · Inter (body) · Manjari (Malayalam)
  lib/utils/cn.ts      class merging
```

## Design tokens

Defined once in `src/app/globals.css`: raw values on `:root` / `.dark`, mapped
to Tailwind via `@theme inline`.

- Brand: **#1f7fec** (`brand-500`) on white — the chosen identity colour.
  Contrast is symmetric, so #1f7fec is 3.96:1 against white *both* as text and
  as a fill behind white text. That clears AA for large text and UI (3:1) but
  **not** for body-size text (4.5:1). Therefore:
  - `brand-500` #1f7fec → large headings, icons, borders, markers
  - `brand-600` #1a6fd0 → button fills, links, small text (4.97:1)
  - `brand-700` #145aab → strong text (6.7:1)
- Public sections alternate `surface="paper"` (pure white) and `surface="tint"`.
- Public pages fall back to `src/content/defaults.ts` when a table has no
  published rows, so the site is presentable before the committee fills it in.
- Accent: warm gold (`accent-500`) — large text, borders and icons only.
  **Never a button fill** — gold-on-white fails AA at body sizes.
- The homepage hero keeps the campus photograph (`public/images/campus-hero.png`)
  with a dark scrim. The header inverts to white over it until the page scrolls.
- Type: `text-display` / `text-h1` … `text-eyebrow`, all fluid via `clamp()`
- Rhythm: `py-section-sm` … `py-section-xl` (4rem → 10rem)

## Motion

Always import `m` from `motion/react`, never `motion` — the app wraps everything
in `LazyMotion` with `domAnimation` to keep the bundle small. `strict` mode is
on, so `motion.*` will throw.

## Data layer

Four Supabase clients, each with one job — using the wrong one is the most
likely way to break performance or security:

| Client | Use for |
| --- | --- |
| `lib/supabase/public.ts` | Public page reads. Cookie-free, so pages stay static/ISR. |
| `lib/supabase/server.ts` | Server Actions and admin Server Components (carries the session). |
| `lib/supabase/client.ts` | Browser, admin only — Storage uploads. |
| `lib/supabase/admin.ts` | Service role. Bypasses RLS. Almost never correct. |

- **Never `select("*")`** — list columns explicitly, as in `lib/queries/faculty.ts`.
- Every public read is wrapped in `cachedQuery` with a tag from `lib/cache-tags.ts`;
  every mutation revalidates the matching tag.
- Public reads **fall back to empty**, never throw: one dead section beats a 500
  for every visitor. Admin code surfaces errors instead.
- Content tables carry `status`, `deleted_at`, `display_order` and authorship,
  and get their triggers and policies from `attach_content_triggers` /
  `attach_content_policies`. Use those helpers so a new table cannot ship with
  weaker rules than the rest.
- Deletes are **soft** (`deleted_at`). A committee mis-click must be recoverable.

## Admin panel

- **Three security layers, never one.** `src/proxy.ts` keeps anonymous users
  out of `/admin` at the edge; `lib/auth.ts` (`requireStaff` / `requireAdmin` /
  `requireSuperAdmin`) decides what a signed-in user may see; RLS decides what
  the database will actually return.
- `lib/auth.ts` is `server-only`. Client components import roles and the profile
  shape from `lib/roles.ts` instead — importing from `auth.ts` drags the
  Supabase server client into the browser bundle and fails the build.
- Roles: `super_admin` (everything), `editor` (content), `viewer` (read-only).
  Gate write UI with `canWrite(role)`.
- **Images upload browser → Storage directly.** `lib/utils/image.ts` crops,
  resizes and converts to WebP client-side; the server action only writes the
  `media` row. Never route binaries through a serverless function.
- Alt text is enforced in `lib/validation/media.ts`: an empty alt is possible
  only by explicitly ticking "decorative".

## Database workflow

Migrations are authored by hand in `supabase/migrations` and applied with the
CLI. There is no Docker here, so nothing runs locally:

```bash
npx supabase link --project-ref <ref>
npm run db:push
npm run db:types   # replaces the hand-written src/types/database.ts
```

`src/types/database.ts` is hand-authored until a project is linked — keep it in
lockstep with the migrations, then regenerate and stop editing it.

## Commands

```bash
npm run dev
npm run build
npm run lint
```

`/styleguide` renders every primitive in both themes. It is `noindex` and is not
linked from the site.
