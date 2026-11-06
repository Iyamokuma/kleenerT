-- Kleener Touch — website bookings
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  full_name      text not null check (char_length(full_name) between 2 and 120),
  phone          text not null check (char_length(phone) between 7 and 20),
  email          text check (email is null or char_length(email) <= 254),
  service        text not null check (char_length(service) <= 120),
  property_type  text check (property_type is null or char_length(property_type) <= 60),
  location       text not null check (char_length(location) between 3 and 200),
  preferred_date date not null,
  preferred_time text check (preferred_time is null or char_length(preferred_time) <= 30),
  frequency      text check (frequency is null or char_length(frequency) <= 40),
  notes          text check (notes is null or char_length(notes) <= 2000),
  status         text not null default 'new'
                 check (status in ('new', 'confirmed', 'completed', 'cancelled'))
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- Visitors can only create bookings. They cannot read, edit or delete any,
-- so the public key in the website cannot be used to view customer details.
alter table public.bookings enable row level security;

revoke all on public.bookings from anon, authenticated;
grant insert on public.bookings to anon;

drop policy if exists "Website visitors can create bookings" on public.bookings;
create policy "Website visitors can create bookings"
  on public.bookings
  for insert
  to anon
  with check (status = 'new');

-- View bookings in Dashboard → Table Editor → bookings (the dashboard bypasses RLS).
