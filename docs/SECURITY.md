# Security

First security audit for Spotra (Phase 1). This document summarizes findings and fixes. Do not commit secrets to this file.

**Pre-launch:** see [`PRE_LAUNCH_AUDIT.md`](./PRE_LAUNCH_AUDIT.md) for the full RLS matrix, blockers, and launch checklist.

## Phase 1 fixes (implemented)

| Area | Fix |
|------|-----|
| Organizer session | HMAC-SHA256 signed cookie (`ORGANIZER_SESSION_SECRET`) |
| Organizer mutations | `requireOrganizerSession` / `requireOwnEvent` on create, update, delete, feature, check-in, venue, artist |
| Ticket check-in | Organizer must own event; public verify page hides check-in UI for others |
| Open redirect | `sanitizeReturnTo()` rejects `//` and `/\` paths |
| Payfast ITN | Validates `amount_gross` vs order total and `merchant_id` |
| Dev organizer login | Empty-password login removed; `ORGANIZER_DEV_PASSWORD` required without Supabase |

## Findings (audit summary)

| Severity | Finding | Status |
|----------|---------|--------|
| Critical | Forgable organizer session cookie | Fixed (Phase 1) |
| Critical | Unauthenticated organizer server actions | Fixed (Phase 1) |
| Critical | Public ticket check-in by code | Fixed (Phase 1) |
| High | Public RLS read on orders/tickets (buyer PII) | Fixed (Phase 2 — migration `0017`) |
| High | Payfast amount not verified | Fixed (Phase 1) |
| High | Organizer dashboard pages lack ownership checks | Fixed (Phase 2 — `requireOwnEvent` on event pages) |
| Medium | Open redirect via `//evil.com` | Fixed (Phase 1) |
| Medium | Dev empty-password organizer login | Fixed (Phase 1) |
| Medium | Non-transactional ticket fulfillment / oversell risk | Phase 2 |
| Low | Short ticket codes, no login rate limits | Phase 2 |

## Environment

```env
# Required in production for organizer sessions
ORGANIZER_SESSION_SECRET=<long-random-string>

# Local dev without Supabase only
ORGANIZER_DEV_PASSWORD=<dev-only-password>
```

Existing unsigned organizer cookies are invalidated after Phase 1 deploy — organizers must sign in again.

## Phase 2 backlog

- ~~Tighten Supabase RLS: remove public read on `orders` and `tickets`; add `user_id`-scoped policies~~ (migration `0017`)
- ~~Ownership checks on organizer dashboard pages (edit, tickets, scan, promos)~~ (implemented)
- ~~RLS: restrict public `events` read to approved/public organizers~~ (migration `0026`)
- ~~RLS: remove public read on `promo_codes`~~ (migration `0026`)
- ~~RLS: enable policies on `homepage_carousel_slides`~~ (migration `0026`)
- ~~Transactional ticket fulfillment~~ (migration `0026` + `fulfill_ticket_order` RPC)
- ~~Stronger ticket code entropy~~ (16 hex chars)
- ~~Login / verify / check-in rate limiting~~ (migration `0026` + `lib/auth/rate-limit.ts`)
- Payfast server-to-server confirmation POST (optional hardening)

## Reporting

Report security issues to the project maintainers via the contact email in the app footer.
