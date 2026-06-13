# Tonti

Live music ticketing platform — concerts, club nights, and festivals only.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — featured shows, genres, cities |
| `/events` | Browse & filter all events |
| `/events/[slug]` | Event detail + ticket tiers |
| `/artists/[slug]` | Artist profile + upcoming shows |
| `/venues/[slug]` | Venue calendar |
| `/cities/[slug]` | City event hub |
| `/organizer` | Promoter dashboard (placeholder) |

## What's next

- [ ] PostgreSQL + Prisma schema
- [ ] Stripe Checkout + Connect for payouts
- [ ] Auth (Clerk) for fans & organizers
- [ ] Organizer dashboard (create events, scan tickets)
- [ ] QR ticket generation & door scanning

## Project structure

```
app/           → Routes & pages
components/    → UI, layout, event components
lib/
  data/        → Seed data (events, artists, venues)
  types.ts     → Shared TypeScript types
  utils.ts     → Formatting helpers
```
