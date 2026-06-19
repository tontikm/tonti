-- Organizer profile fields and event ownership / policies.

alter table organizers
  add column if not exists slug text unique,
  add column if not exists logo text,
  add column if not exists bio text,
  add column if not exists phone text,
  add column if not exists website_url text,
  add column if not exists instagram_url text,
  add column if not exists invoice_company_name text,
  add column if not exists invoice_address_line1 text,
  add column if not exists invoice_address_line2 text,
  add column if not exists invoice_city text,
  add column if not exists invoice_province text,
  add column if not exists invoice_postal_code text,
  add column if not exists vat_number text,
  add column if not exists default_refund_policy text;

create index if not exists organizers_slug_idx on organizers (slug);

alter table events
  add column if not exists organizer_id uuid references organizers (id) on delete set null,
  add column if not exists prohibited_items text[] not null default '{}',
  add column if not exists contact_email text,
  add column if not exists refund_policy text;

create index if not exists events_organizer_id_idx on events (organizer_id);
