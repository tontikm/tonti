# Tonti

South Africa's home for live music — discover gigs, festivals, and club nights.
Black-and-white, Tixr-inspired interface built around the pixel TONTI logo.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4** (monochrome design system + a single electric-lime accent)
- **motion** (Framer Motion) for scroll reveals, hover springs, and micro-interactions
- **cmdk** for the Cmd/Ctrl-K command palette
- **react-leaflet** + OSM tiles for the events map discovery view
- **lucide-react** icons
- **Supabase** (optional content backend; falls back to local seed data)
- **PWA**: installable web app manifest + service worker so opened tickets (QR
  codes) work offline at the door

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs entirely on local seed data in `lib/data/` — no backend required to
develop. Pricing is in ZAR (R) and all times are SAST (Africa/Johannesburg).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — featured shows, categories, cities |
| `/events` | Browse with search + category/city/date/free filters |
| `/events/[slug]` | Event detail, tiers, WhatsApp share |
| `/events/[slug]/checkout` | Checkout — sign in, free RSVP or Payfast for paid tiers |
| `/login` | Fan sign-in / sign-up (email or Google) |
| `/tickets/[orderId]` | RSVP confirmation with QR codes |
| `/tickets/verify/[code]` | Scan / verify ticket at the door |
| `/payments/payfast/start` | Redirects to Payfast (paid orders) |
| `/artists/[slug]` | Artist profile + upcoming shows |
| `/venues/[slug]` | Venue calendar |
| `/cities/[slug]` | City event hub |
| `/organizer/login` | Organizer sign-in |
| `/organizer/register` | Create organizer account |
| `/organizer` | Dashboard — stats, upcoming events, quick actions |
| `/organizer/events` | List, edit, delete, and feature events |
| `/organizer/events/new` | Create event form |
| `/organizer/events/[slug]/edit` | Edit event + re-upload poster |
| `/organizer/events/[slug]/tickets` | Guest list, tier stats, search |
| `/organizer/events/[slug]/scan` | Mobile door scanner + manual check-in |
| `/organizer/venues` | List venues available for events |
| `/organizer/venues/new` | Add a new venue |
| `/organizer/artists` | List artists available for lineups |
| `/organizer/artists/new` | Add a new artist |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |
| `/popia` | POPIA compliance |
| `/cookies` | Cookie policy |
| `/refunds` | Refund policy |
| `/help` | Help & support |

Social links (Instagram, WhatsApp, TikTok, Facebook) appear in the footer and on
legal pages. Configure URLs via `NEXT_PUBLIC_*` vars in `.env.local` (see
`.env.example`).

## Data layer

Pages read events through async helpers in
[`lib/data/events.ts`](lib/data/events.ts) (`getAllEvents`, `getEventBySlug`,
etc.). These read from Supabase when it's configured, and otherwise fall back to
the seed arrays.

**Event categories** (Nightlife, Festival, Music, Lifestyle) live in
[`lib/data/categories.ts`](lib/data/categories.ts). **Artist genres** (amapiano,
house, etc.) remain in [`lib/data/genres.ts`](lib/data/genres.ts) for artist
profiles only. **Cities** are in [`lib/data/cities.ts`](lib/data/cities.ts).

## Connecting Supabase

Run migrations **in order** in the Supabase SQL editor:

| Migration | Purpose |
|-----------|---------|
| [`0001_init.sql`](supabase/migrations/0001_init.sql) | Core schema |
| [`0002_event_posters_storage.sql`](supabase/migrations/0002_event_posters_storage.sql) | Poster uploads |
| [`0003_tickets.sql`](supabase/migrations/0003_tickets.sql) | Orders + QR tickets |
| [`0004_event_organizer_branding.sql`](supabase/migrations/0004_event_organizer_branding.sql) | Organizer logos in event header |
| [`0005_organizers.sql`](supabase/migrations/0005_organizers.sql) | Organizer password accounts |
| [`0006_payments.sql`](supabase/migrations/0006_payments.sql) | Payfast order tracking |
| [`0007_fan_orders.sql`](supabase/migrations/0007_fan_orders.sql) | Fan account order linking |
| [`0008_organizer_profiles.sql`](supabase/migrations/0008_organizer_profiles.sql) | Organizer profiles |
| [`0009_orders_buyer_phone.sql`](supabase/migrations/0009_orders_buyer_phone.sql) | WhatsApp opt-in phone |
| [`0010_orders_service_fee.sql`](supabase/migrations/0010_orders_service_fee.sql) | 3% platform fee tracking |
| [`0011_event_follows.sql`](supabase/migrations/0011_event_follows.sql) | Fan event follows |
| [`0012_promo_codes.sql`](supabase/migrations/0012_promo_codes.sql) | Promo codes + order discounts |
| [`0013_event_show_organizer_profile.sql`](supabase/migrations/0013_event_show_organizer_profile.sql) | Opt-in organizer profile on event pages |
| [`0014_event_age_range.sql`](supabase/migrations/0014_event_age_range.sql) | Optional maximum age for events |
| [`0015_backfill_event_organizer_id.sql`](supabase/migrations/0015_backfill_event_organizer_id.sql) | Backfill `organizer_id` from `contact_email` |
| [`0016_remove_demo_events.sql`](supabase/migrations/0016_remove_demo_events.sql) | Remove deprecated seed demo events |
| [`0017_orders_tickets_rls.sql`](supabase/migrations/0017_orders_tickets_rls.sql) | Restrict orders/tickets reads to owning fan |
| [`0018_remove_all_seed_events.sql`](supabase/migrations/0018_remove_all_seed_events.sql) | Remove remaining fictional seed events |

Then:

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, keys, NEXT_PUBLIC_SITE_URL
npx tsx --env-file=.env.local scripts/seed-supabase.ts
```

## Organizer dashboard

1. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
2. Run migration **0005** for password accounts.
3. Register at `/organizer/register`, then sign in at `/organizer/login`.

Without Supabase, set `ORGANIZER_DEV_PASSWORD` in `.env.local` for a simple local
password gate (empty passwords are not accepted).

Set `ORGANIZER_SESSION_SECRET` to a long random string in `.env.local` and
production. Organizer sessions are HMAC-signed; unsigned legacy cookies are rejected.
See [`docs/SECURITY.md`](docs/SECURITY.md).

When creating events, venues and artists are matched by name. Unmatched artists are
created automatically; new venues need a city selected in the inline form.

## Fan accounts (checkout)

Checkout requires a signed-in fan account when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set.

1. In Supabase → **Authentication → Providers**, enable **Email** and **Google**.
2. In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials, create an **OAuth 2.0 Client ID** (Web application). Set the authorized redirect URI to your Supabase callback (not Tonti):
   - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Project ref is in Supabase → Settings → API.
3. Paste the Google **Client ID** and **Client Secret** into Supabase → Authentication → Providers → Google.
4. In Supabase → **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) or your production domain
   - Redirect URLs: `http://localhost:3000/auth/callback` and `https://your-domain.co.za/auth/callback`
5. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the origin users visit (e.g. `http://localhost:3000`).

## Payfast (paid tickets)

When these env vars are set, paid checkout redirects to Payfast and tickets are
issued after the ITN webhook confirms payment:

- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE` (if configured in Payfast)
- `PAYFAST_SANDBOX=true` for testing
- `NEXT_PUBLIC_SITE_URL` (must be publicly reachable for ITN in production)

Without Payfast, paid tiers use **pay at door** — tickets are issued immediately
with no online charge.

## Platform fee

Tonti charges a **3% platform fee on paid tickets** (free RSVPs are excluded). Fans
pay the listed ticket price; the fee is absorbed by the organizer and stored on each
order as `service_fee` (see migration `0010_orders_service_fee.sql`). Revenue
breakdown appears on the organizer event tickets page.

## Deploy to Vercel

1. Push this repo to GitHub (`main` branch).
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo (Next.js defaults are fine).
3. Add environment variables from [`.env.example`](.env.example) under **Settings → Environment Variables**:
   - Copy Supabase keys from your Supabase project.
   - Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://tonti.vercel.app`).
   - Set `ORGANIZER_SESSION_SECRET` to the same long random string as local (`openssl rand -hex 32`).
4. Deploy, then in Supabase → **Authentication → URL configuration**:
   - **Site URL:** your Vercel URL
   - **Redirect URLs:** `https://your-project.vercel.app/auth/callback`
5. Open the Vercel URL on your phone — same site as desktop.

Each `git push` to `main` triggers a new production deploy. Local `npm run dev` is unchanged.

## Deploy checklist

See **[`docs/LAUNCH.md`](docs/LAUNCH.md)** for the full step-by-step launch guide.

1. Run all migrations on production Supabase (through `0018_remove_all_seed_events.sql`).
2. Set env vars on Vercel — see `.env.example`.
3. Add production URL + `/auth/callback` to Supabase Auth redirect URLs.
4. Add Payfast notify URL (if using online payments): `https://your-domain.co.za/api/payments/payfast/notify`
5. Create real events via the organizer dashboard (or seed once for staging).
6. Run the smoke test checklist in `docs/LAUNCH.md`.

## What's next

- [x] Organizer event creation form
- [x] Organizer edit/delete events + featured toggle + poster re-upload
- [x] Free RSVP + QR ticket claim
- [x] Organizer guest list + door scanner
- [x] Organizer password auth
- [x] Payfast payments (sandbox + ITN webhook)
- [ ] Yoco, Ozow, SnapScan, EFT
- [ ] Cashless wallet

## Project structure

```
app/              → Routes & pages
components/        → UI, layout, event components
lib/
  data/           → Seed data + async event helpers
  payments/       → Payfast integration
  supabase/       → Server client factory
  types.ts        → Shared TypeScript types
  utils.ts        → ZAR / SAST formatting helpers
supabase/
  migrations/     → SQL schema
scripts/          → Logo processing + Supabase seed
public/           → Logo assets
```
