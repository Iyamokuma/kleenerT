-- ============================================================================
-- Kleener Touch · 001 · Bookings + public booking endpoint
--
-- Visitors never touch the table directly. The website calls
-- public.create_booking(), which validates input, rate-limits by phone
-- number and returns a human-friendly reference such as KT-261105-4F2A.
-- ============================================================================

-- Short reference shown to the customer and used by staff on the phone.
create or replace function public.generate_booking_reference()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'KT-'
    || to_char(now() at time zone 'Africa/Lagos', 'YYMMDD')
    || '-'
    || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
$$;

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique default public.generate_booking_reference(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  full_name      text not null check (char_length(full_name) between 2 and 120),
  phone          text not null check (char_length(phone) between 7 and 20),
  -- Last 10 digits, so 0801…, +234801… and 234801… group as one customer.
  phone_key      text generated always as (right(regexp_replace(phone, '\D', '', 'g'), 10)) stored,
  email          text check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),

  service        text not null check (char_length(service) between 2 and 120),
  property_type  text check (property_type is null or char_length(property_type) <= 60),
  location       text not null check (char_length(location) between 3 and 200),
  preferred_date date not null,
  preferred_time text check (preferred_time is null or char_length(preferred_time) <= 30),
  frequency      text check (frequency is null or char_length(frequency) <= 40),
  notes          text check (notes is null or char_length(notes) <= 2000),

  status         text not null default 'new'
                 check (status in ('new', 'contacted', 'confirmed', 'completed', 'cancelled')),
  source         text not null default 'website'
);

create index if not exists bookings_created_at_idx     on public.bookings (created_at desc);
create index if not exists bookings_status_idx         on public.bookings (status);
create index if not exists bookings_preferred_date_idx on public.bookings (preferred_date);
create index if not exists bookings_phone_key_idx      on public.bookings (phone_key);

-- Keep updated_at honest on every edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Lock the table down. Only create_booking() (below) and, later, signed-in
-- admins can reach it.
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Public endpoint used by the website's booking form.
-- ----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_full_name      text,
  p_phone          text,
  p_service        text,
  p_location       text,
  p_preferred_date date,
  p_email          text default null,
  p_property_type  text default null,
  p_preferred_time text default null,
  p_frequency      text default null,
  p_notes          text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone_key text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  v_digits    int  := char_length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'));
  v_today     date := (now() at time zone 'Africa/Lagos')::date;
  v_reference text;
begin
  if char_length(trim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Please enter your full name.' using errcode = '22023';
  end if;
  if v_digits < 10 or v_digits > 15 then
    raise exception 'Please enter a valid phone number.' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_service, ''))) < 2 then
    raise exception 'Please choose a service.' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_location, ''))) < 3 then
    raise exception 'Please tell us where the service is needed.' using errcode = '22023';
  end if;
  if p_preferred_date is null or p_preferred_date < v_today or p_preferred_date > v_today + 365 then
    raise exception 'Please choose a date between today and the next 12 months.' using errcode = '22023';
  end if;

  -- Rate limits: one phone can't flood the inbox, and neither can a bot farm.
  if (select count(*) from public.bookings
        where phone_key = v_phone_key and created_at > now() - interval '15 minutes') >= 3 then
    raise exception 'You have sent several requests already. We will be in touch, or call 0701 430 8301.'
      using errcode = 'P0001', hint = 'rate_limited';
  end if;
  if (select count(*) from public.bookings where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'We are receiving a lot of requests right now. Please try again in a minute.'
      using errcode = 'P0001', hint = 'rate_limited';
  end if;

  -- Retry on the rare reference collision.
  for attempt in 1..5 loop
    begin
      insert into public.bookings (
        full_name, phone, email, service, property_type, location,
        preferred_date, preferred_time, frequency, notes
      ) values (
        left(trim(p_full_name), 120),
        left(trim(p_phone), 20),
        nullif(lower(trim(p_email)), ''),
        left(trim(p_service), 120),
        nullif(left(trim(p_property_type), 60), ''),
        left(trim(p_location), 200),
        p_preferred_date,
        nullif(left(trim(p_preferred_time), 30), ''),
        nullif(left(trim(p_frequency), 40), ''),
        nullif(left(trim(p_notes), 2000), '')
      )
      returning reference into v_reference;
      return v_reference;
    exception when unique_violation then
      if attempt = 5 then raise; end if;
    end;
  end loop;
end;
$$;

revoke all on function public.create_booking(text, text, text, text, date, text, text, text, text, text) from public;
grant execute on function public.create_booking(text, text, text, text, date, text, text, text, text, text) to anon, authenticated;
revoke all on function public.generate_booking_reference() from public, anon, authenticated;
