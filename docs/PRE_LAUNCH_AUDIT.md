# Pre-launch security audit

Audit date: June 2025. Updated after migration `0026_security_hardening.sql`.

## Summary

| Area | Status |
|------|--------|
| Organizer/admin session forgery | Fixed (HMAC-signed cookies) |
| Organizer mutations without auth | Fixed (`requireOrganizerSession` / `requireOwnEvent`) |
| Public check-in by ticket code | Fixed (ownership check on `checkInTicket`) |
| Orders/tickets PII via anon API | Fixed (migration `0017`) |
| Pending events via direct Supabase API | **Fixed** (`0026` — `is_event_public`) |
| Promo code enumeration via anon API | **Fixed** (`0026` — public read removed) |
| Ticket oversell under concurrency | **Fixed** (`0026` — `fulfill_ticket_order` RPC) |
| Login / verify rate limits | **Fixed** (`0026` + `lib/auth/rate-limit.ts`) |
| `homepage_carousel_slides` RLS | **Fixed** (`0026`) |
| Short ticket codes | **Fixed** (16 hex chars, ~64 bits) |
| Ticket page without fan auth | **Fixed** (requires auth when Supabase configured) |

**Apply migration `0026` on production Supabase before launch.**

---

## RLS policy matrix (after `0026`)

| Table | Anon/authenticated access |
|-------|---------------------------|
| `events`, `ticket_tiers`, `event_artists` | Public read only for approved events from approved organizers |
| `orders`, `tickets` | Own rows only (`0017`) |
| `event_follows` | Own rows |
| `promo_codes` | **Denied** (server validates at checkout) |
| `organizers`, `platform_admins`, `organizer_payouts`, `rate_limit_events` | **Denied** |
| `homepage_carousel_slides` | Active slides only |
| Catalog (`artists`, `venues`) | Public read |

---

## Blockers (verify before launch)

- [ ] Migrations `0001`–`0026` applied in production
- [ ] `0017` — `users read own orders` / `users read own tickets`
- [ ] `0026` — `public read visible events`, no `public read promo_codes`, `fulfill_ticket_order` function exists
- [ ] Session secrets set in Vercel; `ORGANIZER_DEV_PASSWORD` unset in production
- [ ] Pilot organizer and events approved in `/admin`

---

## Remaining backlog (low priority)

- Payfast server-to-server confirmation POST (optional)
- Tune Supabase Auth rate limits in dashboard
- Consider splitting `getSupabaseServer()` to anon-only for fan reads (defense in depth)

---

## Related docs

- [`docs/SECURITY.md`](./SECURITY.md)
- [`docs/LAUNCH.md`](./LAUNCH.md)
