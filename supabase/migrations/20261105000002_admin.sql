-- ============================================================================
-- Kleener Touch · 002 · Admin dashboard
--
-- • admin_users: allow-list of staff emails that may sign in to /admin
-- • Operational columns on bookings (assignee, schedule, quote)
-- • booking_events: activity timeline, written automatically by triggers
-- • admin_dashboard_stats(): one call for the overview page
-- • booking_customers: one row per customer (grouped by phone number)
-- • Realtime on bookings so new requests appear instantly
-- • Staff can log phone / WhatsApp / walk-in bookings
--
-- Requires 001. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Admin allow-list
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  email    text primary key check (email = lower(email) and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  added_at timestamptz not null default now(),
  added_by text
);

insert into public.admin_users (email, added_by)
values ('booking.kleenertouch@gmail.com', 'setup')
on conflict (email) do nothing;

-- True only for a signed-in user whose *confirmed* email is on the allow-list.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.admin_users a on a.email = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select, insert, delete on public.admin_users to authenticated;

drop policy if exists "Admins can view admins" on public.admin_users;
create policy "Admins can view admins" on public.admin_users
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can add admins" on public.admin_users;
create policy "Admins can add admins" on public.admin_users
  for insert to authenticated
  with check (public.is_admin() and added_by = lower(auth.jwt() ->> 'email'));

drop policy if exists "Admins can remove other admins" on public.admin_users;
create policy "Admins can remove other admins" on public.admin_users
  for delete to authenticated
  using (public.is_admin() and email <> lower(auth.jwt() ->> 'email'));

-- ---------------------------------------------------------------------------
-- Operational columns on bookings
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists assigned_to    text check (assigned_to is null or char_length(assigned_to) <= 120),
  add column if not exists scheduled_date date,
  add column if not exists scheduled_time text check (scheduled_time is null or char_length(scheduled_time) <= 30),
  add column if not exists quoted_amount  numeric(12, 2) check (quoted_amount is null or quoted_amount >= 0);

-- The date the job actually happens: the confirmed date if set, else the customer's preference.
alter table public.bookings
  add column if not exists service_date date generated always as (coalesce(scheduled_date, preferred_date)) stored;

create index if not exists bookings_service_date_idx on public.bookings (service_date);

grant select, insert, update, delete on public.bookings to authenticated;
-- Column default for reference on staff-entered bookings runs as the signed-in user.
grant execute on function public.generate_booking_reference() to authenticated;

drop policy if exists "Admins can view bookings" on public.bookings;
create policy "Admins can view bookings" on public.bookings
  for select to authenticated using (public.is_admin());

-- Staff log bookings that arrive by phone, WhatsApp or walk-in.
drop policy if exists "Admins can add bookings" on public.bookings;
create policy "Admins can add bookings" on public.bookings
  for insert to authenticated with check (public.is_admin() and source <> 'website');

drop policy if exists "Admins can update bookings" on public.bookings;
create policy "Admins can update bookings" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete bookings" on public.bookings;
create policy "Admins can delete bookings" on public.bookings
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Activity timeline
-- ---------------------------------------------------------------------------
create table if not exists public.booking_events (
  id         bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  created_at timestamptz not null default now(),
  actor      text not null default coalesce(lower(auth.jwt() ->> 'email'), 'system'),
  kind       text not null check (kind in ('created', 'status', 'update', 'note')),
  message    text not null check (char_length(message) between 1 and 2000),
  meta       jsonb
);

create index if not exists booking_events_booking_idx on public.booking_events (booking_id, created_at desc);

alter table public.booking_events enable row level security;
revoke all on public.booking_events from anon, authenticated;
grant select, insert on public.booking_events to authenticated;

drop policy if exists "Admins can view activity" on public.booking_events;
create policy "Admins can view activity" on public.booking_events
  for select to authenticated using (public.is_admin());

-- Admins may only add notes, in their own name. Everything else is written by triggers.
drop policy if exists "Admins can add notes" on public.booking_events;
create policy "Admins can add notes" on public.booking_events
  for insert to authenticated
  with check (public.is_admin() and kind = 'note' and actor = lower(auth.jwt() ->> 'email'));

create or replace function public.log_booking_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.source = 'website' then
    insert into public.booking_events (booking_id, actor, kind, message)
    values (new.id, 'customer', 'created', 'Booking received via website');
  else
    insert into public.booking_events (booking_id, actor, kind, message)
    values (new.id, coalesce(lower(auth.jwt() ->> 'email'), 'system'), 'created', 'Booking logged by staff (' || new.source || ')');
  end if;
  return new;
end;
$$;

create or replace function public.log_booking_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor   text := coalesce(lower(auth.jwt() ->> 'email'), 'system');
  v_changes text[] := '{}';
begin
  if new.status is distinct from old.status then
    insert into public.booking_events (booking_id, actor, kind, message, meta)
    values (new.id, v_actor, 'status',
            'Status changed from ' || old.status || ' to ' || new.status,
            jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    v_changes := v_changes || coalesce('assigned to ' || new.assigned_to, 'unassigned');
  end if;
  if new.scheduled_date is distinct from old.scheduled_date or new.scheduled_time is distinct from old.scheduled_time then
    v_changes := v_changes || coalesce(
      'scheduled for ' || to_char(new.scheduled_date, 'Dy DD Mon YYYY') || coalesce(' (' || new.scheduled_time || ')', ''),
      'schedule cleared');
  end if;
  if new.quoted_amount is distinct from old.quoted_amount then
    v_changes := v_changes || coalesce('quote set to ₦' || to_char(new.quoted_amount, 'FM999,999,999,990'), 'quote cleared');
  end if;

  if array_length(v_changes, 1) > 0 then
    insert into public.booking_events (booking_id, actor, kind, message)
    values (new.id, v_actor, 'update', initcap(left(array_to_string(v_changes, ', '), 1)) || substr(array_to_string(v_changes, ', '), 2));
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_log_created on public.bookings;
create trigger bookings_log_created
  after insert on public.bookings
  for each row execute function public.log_booking_created();

drop trigger if exists bookings_log_changes on public.bookings;
create trigger bookings_log_changes
  after update on public.bookings
  for each row execute function public.log_booking_changes();

-- Backfill a "created" event for bookings made before this migration.
insert into public.booking_events (booking_id, created_at, actor, kind, message)
select b.id, b.created_at, 'customer', 'created', 'Booking received via ' || b.source
from public.bookings b
where not exists (select 1 from public.booking_events e where e.booking_id = b.id and e.kind = 'created');

-- ---------------------------------------------------------------------------
-- Overview numbers in one round trip
-- ---------------------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today       date := (now() at time zone 'Africa/Lagos')::date;
  v_month_start date := date_trunc('month', v_today)::date;
  v_result      jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total',            (select count(*) from public.bookings),
    'new_today',        (select count(*) from public.bookings where (created_at at time zone 'Africa/Lagos')::date = v_today),
    'this_month',       (select count(*) from public.bookings where (created_at at time zone 'Africa/Lagos')::date >= v_month_start),
    'last_month',       (select count(*) from public.bookings
                          where (created_at at time zone 'Africa/Lagos')::date >= (v_month_start - interval '1 month')::date
                            and (created_at at time zone 'Africa/Lagos')::date < v_month_start),
    'upcoming_7d',      (select count(*) from public.bookings
                          where service_date between v_today and v_today + 6
                            and status in ('new', 'contacted', 'confirmed')),
    'completed_month',  (select count(*) from public.bookings where status = 'completed' and service_date >= v_month_start),
    'revenue_month',    (select coalesce(sum(quoted_amount), 0) from public.bookings
                          where status = 'completed' and service_date >= v_month_start),
    'status_counts',    (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                          from (select status, count(*) as n from public.bookings group by status) s),
    'daily',            (select jsonb_agg(jsonb_build_object('day', d::date, 'count', coalesce(c.n, 0)) order by d)
                          from generate_series(v_today - 29, v_today, interval '1 day') d
                          left join (
                            select (created_at at time zone 'Africa/Lagos')::date as booked_on, count(*) as n
                            from public.bookings
                            where created_at >= (v_today - 29)::timestamp at time zone 'Africa/Lagos'
                            group by 1
                          ) c on c.booked_on = d::date),
    'by_service',       (select coalesce(jsonb_agg(jsonb_build_object('service', service, 'count', n) order by n desc), '[]'::jsonb)
                          from (select service, count(*) as n from public.bookings group by service) s)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Customers: one row per phone number. security_invoker keeps RLS in force.
-- ---------------------------------------------------------------------------
create or replace view public.booking_customers
with (security_invoker = true)
as
select
  phone_key,
  (array_agg(full_name order by created_at desc))[1]                               as full_name,
  (array_agg(phone order by created_at desc))[1]                                   as phone,
  (array_agg(email order by created_at desc) filter (where email is not null))[1]  as email,
  (array_agg(location order by created_at desc))[1]                                as last_location,
  count(*)                                                                         as bookings_count,
  count(*) filter (where status = 'completed')                                     as completed_count,
  coalesce(sum(quoted_amount) filter (where status = 'completed'), 0)              as total_value,
  min(created_at)                                                                  as first_booking_at,
  max(created_at)                                                                  as last_booking_at
from public.bookings
group by phone_key;

revoke all on public.booking_customers from anon;
grant select on public.booking_customers to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: new and changed bookings stream to signed-in admins (RLS applies).
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end;
$$;
