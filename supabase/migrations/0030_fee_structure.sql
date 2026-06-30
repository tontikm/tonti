-- Booking fee, processing fee tracking, and payout verification.

alter table orders
  add column if not exists booking_fee numeric not null default 0;

alter table orders
  add column if not exists processing_fee numeric not null default 0;

alter table orders
  add column if not exists payment_method text;

alter table organizers
  add column if not exists payout_verified_at timestamptz;

alter table organizers
  add column if not exists payout_verification_method text
    check (
      payout_verification_method is null
      or payout_verification_method in ('cipc', 'id_bank_letter')
    );

alter table organizers
  add column if not exists payout_verification_notes text;

alter table organizer_payouts
  add column if not exists event_slug text references events (slug) on delete set null;
