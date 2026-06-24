# Spotra launch checklist

Use this after code is deployed to Vercel. Complete each section in order.

## 1a. Supabase region (South Africa)

Supabase **cannot change region** on an existing project, and **does not offer Africa (Cape Town)** as a primary region today. The full list is in the [Supabase regions docs](https://supabase.com/docs/guides/platform/regions).

For a South African audience, pick the **closest available** primary region when creating a new project:

| Priority | Region | Code |
|----------|--------|------|
| **Recommended** | South Asia (Mumbai) | `ap-south-1` |
| Alternative | South America (São Paulo) | `sa-east-1` |
| EU (if you prefer) | West EU (Ireland) | `eu-west-1` |

Your app runs on **Vercel** (edge/serverless), so most page loads are fast; the Supabase region mainly affects database round-trips (checkout, login, organizer dashboard). Mumbai is usually the best Supabase choice for SA fans and organizers.

**Fresh start checklist** (no data migration from an old project):

1. Supabase Dashboard → **New project** → Region: **South Asia (Mumbai)** `ap-south-1` (or your chosen region above).
2. Run all migrations in section 1 below (`0001` through `0023`) in the SQL editor.
3. Copy **Project URL**, **anon key**, and **service role key** from Settings → API.
4. Update **Vercel** env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and redeploy.
5. Update **local** `.env.local` with the same keys.
6. Create platform admin: `npx tsx --env-file=.env.local scripts/create-platform-admin.ts ...`
7. **Authentication → URL configuration:** set Site URL and redirect URLs to your production domain.
8. Organizers **re-register**; approve them in `/admin/organizers`.
9. After smoke tests pass, **pause or delete** the old EU project to avoid double billing.

Skip **`0022_backfill_service_fee.sql`** on a fresh database unless you import legacy orders later.

## 1. Supabase migrations

Run every file in [`supabase/migrations/`](../supabase/migrations/) **in numeric order** in the Supabase SQL editor:

`0001` through `0024` (includes demo event cleanup `0016`–`0018`, orders/tickets RLS `0017`, homepage hero image `0019`, platform admins `0020`, organizer approval `0021`, service fee backfill `0022`, organizer payouts `0023`, and per-event publication `0024`).

After deploying, run **`0022_backfill_service_fee.sql`** once to fix legacy orders with `service_fee = 0`. Optionally run **`0023_organizer_payouts.sql`** to track manual EFT payouts in `/admin/payouts`.

Then create real events at `/organizer/events/new` **or** seed:

```bash
npx tsx --env-file=.env.local scripts/seed-supabase.ts
```

## 2. Vercel environment variables

Copy from [`.env.example`](../.env.example). **Required for production:**

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never expose to client |
| `ORGANIZER_SESSION_SECRET` | `openssl rand -hex 32` |
| `ADMIN_SESSION_SECRET` | `openssl rand -hex 32` (different from organizer secret) |
| `NEXT_PUBLIC_SITE_URL` | Production origin, no trailing slash — e.g. `https://tonti-hm5i.vercel.app` |

**Important:** After changing `NEXT_PUBLIC_SITE_URL`, trigger a **new production deploy** (Vercel → Deployments → Redeploy). The value is embedded at build time.

**Recommended:** `NEXT_PUBLIC_CONTACT_EMAIL`, support/legal emails, social URLs.

**Do not set** `ORGANIZER_DEV_PASSWORD` in production.

## 2b. Platform admin account

After migration `0020_platform_admins.sql`, create your admin login (not linked from the public site):

```bash
npx tsx --env-file=.env.local scripts/create-platform-admin.ts \
  --email you@example.com --password 'your-secure-password' --name 'Site Owner'
```

Sign in at `/admin/login` on your deployed site. From there you can:

- Approve or suspend organizers (`/admin/organizers`)
- Feature events on the homepage (`/admin/events`)
- Review orders and platform fees (`/admin/orders`)
- Export organizer payout CSV and record EFT (`/admin/payouts`)

New organizers register as **pending** — they can use the organizer dashboard, but their events stay hidden until you approve them.

### Payfast (optional)

**Soft launch default:** leave Payfast unset — paid tiers use pay-at-door (tickets issued immediately, no online charge).

To enable online payments later:

| Variable | Notes |
|----------|--------|
| `PAYFAST_MERCHANT_ID` | Production merchant ID |
| `PAYFAST_MERCHANT_KEY` | Production key |
| `PAYFAST_PASSPHRASE` | If configured in Payfast |
| `PAYFAST_SANDBOX` | `true` for testing, `false` for live |

Register ITN notify URL in Payfast:  
`https://your-domain/api/payments/payfast/notify`

Test sandbox end-to-end before `PAYFAST_SANDBOX=false`.

### Payfast sandbox setup (recommended first)

Use this to test paid checkout before going live with real money.

1. **Register a sandbox merchant** at [sandbox.payfast.co.za](https://sandbox.payfast.co.za/) (separate from a future live account).
2. In the sandbox dashboard, copy **Merchant ID**, **Merchant Key**, and set a **Passphrase** under Security / Integration (must match env).
3. Under **Integration**, set the **ITN URL** to your deployed site (Payfast cannot POST to `localhost`):

   `https://<your-vercel-domain>/api/payments/payfast/notify`

4. In **Vercel → Settings → Environment Variables**, add:

   | Variable | Value |
   |----------|--------|
   | `PAYFAST_MERCHANT_ID` | Sandbox merchant ID |
   | `PAYFAST_MERCHANT_KEY` | Sandbox merchant key |
   | `PAYFAST_PASSPHRASE` | Sandbox passphrase |
   | `PAYFAST_SANDBOX` | `true` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-vercel-domain>` (no trailing slash) |

5. **Redeploy** after saving env vars.
6. Create a **paid tier** event at `/organizer/events/new` for testing.

**Sandbox E2E checklist** (run on the deployed URL):

- [ ] Paid checkout button reads **Continue to Payfast** (not pay at door)
- [ ] Redirect to Payfast sandbox and complete test payment
- [ ] Land on `/payments/payfast/complete` → redirects to `/tickets/{orderId}` with QR passes
- [ ] Supabase `orders`: `status = confirmed`, `payment_provider = payfast`, `payment_reference` set
- [ ] Organizer door scanner accepts the ticket
- [ ] Cancel on Payfast returns to checkout with a **Payment cancelled** notice

**If tickets don't appear:** check Vercel logs for `/api/payments/payfast/notify` — common causes are wrong passphrase, ITN URL not registered, or amount mismatch.

**Going live:** swap env vars for production merchant credentials, set `PAYFAST_SANDBOX=false`, register the ITN URL in the **live** Payfast dashboard, and re-run the checklist with a small real payment.

## 3. Supabase Auth

Supabase → **Authentication → Providers:** enable Email (and Google if desired).

**URL configuration** (example for `https://tonti-hm5i.vercel.app`):

- **Site URL:** `https://tonti-hm5i.vercel.app`
- **Redirect URLs:**
  - `https://tonti-hm5i.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (local dev)

Replace with your custom domain when you add one (see section 4).

Google OAuth redirect URI (in Google Cloud Console):  
`https://<project-ref>.supabase.co/auth/v1/callback`

## 4. Custom domain (optional)

1. Add domain in Vercel
2. Update `NEXT_PUBLIC_SITE_URL`
3. Update Supabase Auth Site URL + redirect URLs
4. Update Payfast return/notify URLs if using Payfast

## 5. Smoke test (production)

Run on phone and desktop against the live URL:

- [ ] Fan: browse → event → tickets → checkout → sign in → confirm → QR tickets page
- [ ] Fan: ticket page loads with logo + event thumbnail on each pass
- [ ] Fan: ticket page works offline (airplane mode after first load)
- [ ] Organizer: login → create event → visible on `/events` **after admin approval**
- [ ] Admin: sign in at `/admin/login` → approve organizer → event appears publicly
- [ ] Admin: feature an event on homepage from `/admin/events`
- [ ] Admin: open event **Sales** from `/admin/events` → verify gross, Spotra fee (3%), and organizer net
- [ ] Organizer: door scanner → check in → detail card → Dismiss / Scan next
- [ ] Organizer: tap **Checked in** stat → filtered guest list → **Details** on a row
- [ ] Organizer: export guest list CSV
- [ ] (If Payfast) paid checkout → Payfast → tickets after ITN

## 6. Before broad marketing

- [ ] Phase 2 security migration `0017` applied (tighter orders/tickets RLS)
- [ ] Pilot with one trusted organizer first
- [ ] Confirm demo/seed events removed from production (`0016`)

## Troubleshooting

### Confirmation email opens `localhost` on phone

**Symptom:** After email signup, the Supabase confirmation link points to `http://localhost:3000/...` and does not open on a phone.

**Cause:** `NEXT_PUBLIC_SITE_URL` is missing or set to localhost in Vercel, and/or Supabase Auth **Site URL** still points at localhost. Email signup uses the site origin for `emailRedirectTo`.

**Fix:**

1. Vercel → **Settings → Environment Variables** (Production): set `NEXT_PUBLIC_SITE_URL` to your live origin (e.g. `https://tonti-hm5i.vercel.app`, no trailing slash).
2. **Redeploy** — `NEXT_PUBLIC_*` values are applied at build time.
3. Supabase → **Authentication → URL Configuration**:
   - **Site URL:** same production origin
   - **Redirect URLs:** `https://<your-domain>/auth/callback` (keep `http://localhost:3000/auth/callback` for local dev)
4. Sign up again or resend confirmation from Supabase → Authentication → Users.

Old emails with localhost links will not work after the fix; use a fresh confirmation email.
