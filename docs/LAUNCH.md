# Tonti launch checklist

Use this after code is deployed to Vercel. Complete each section in order.

## 1. Supabase migrations

Run every file in [`supabase/migrations/`](../supabase/migrations/) **in numeric order** in the Supabase SQL editor:

`0001` through `0017` (includes demo event cleanup `0016` and orders/tickets RLS `0017`).

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
