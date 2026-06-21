# Tonti launch checklist

Use this after code is deployed to Vercel. Complete each section in order.

## 1. Supabase migrations

Run every file in [`supabase/migrations/`](../supabase/migrations/) **in numeric order** in the Supabase SQL editor:

`0001` through `0018` (includes demo event cleanup `0016`–`0018` and orders/tickets RLS `0017`).

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
| `NEXT_PUBLIC_SITE_URL` | Production origin, no trailing slash |

**Recommended:** `NEXT_PUBLIC_CONTACT_EMAIL`, support/legal emails, social URLs.

**Do not set** `ORGANIZER_DEV_PASSWORD` in production.

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

**URL configuration:**

- **Site URL:** `https://your-production-domain`
- **Redirect URLs:** `https://your-production-domain/auth/callback`

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
- [ ] Organizer: login → create event → visible on `/events`
- [ ] Organizer: door scanner → check in → detail card → Dismiss / Scan next
- [ ] Organizer: tap **Checked in** stat → filtered guest list → **Details** on a row
- [ ] Organizer: export guest list CSV
- [ ] (If Payfast) paid checkout → Payfast → tickets after ITN

## 6. Before broad marketing

- [ ] Phase 2 security migration `0017` applied (tighter orders/tickets RLS)
- [ ] Pilot with one trusted organizer first
- [ ] Confirm demo/seed events removed from production (`0016`)
