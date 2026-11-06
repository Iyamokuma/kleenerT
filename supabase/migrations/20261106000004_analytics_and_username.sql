-- Kleener Touch: overview analytics in one round trip, and self-service usernames.
--
-- admin_analytics(p_days, p_year) powers the dashboard overview:
--   * period figures for the last p_days days, with the period before for comparison
--   * the sales pipeline, using the activity log to see how far each booking ever got
--     (a job cancelled after confirming still counts as "confirmed" in the funnel)
--   * time to first response: from the booking arriving to its first status change
--   * monthly bookings for p_year, split by outcome
--   * popular services and the weekday × time-of-day pattern of requested dates
-- set_my_username(p_username) lets a signed-in admin change their own username.

create or replace function public.admin_analytics(p_days integer default 30, p_year integer default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today     date := (now() at time zone 'Africa/Lagos')::date;
  v_days      integer := least(greatest(coalesce(p_days, 30), 1), 3660);
  v_from      date;
  v_prev_from date;
  v_year      integer;
  v_result    jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  v_from      := v_today - (v_days - 1);
  v_prev_from := v_from - v_days;
  v_year      := coalesce(p_year, extract(year from v_today)::integer);

  with b as (
    select bk.id, bk.status, bk.source, bk.service, bk.quoted_amount, bk.service_date, bk.preferred_time, bk.created_at,
           (bk.created_at at time zone 'Africa/Lagos')::date as booked_on
    from public.bookings bk
  ),
  cur  as (select * from b where booked_on between v_from and v_today),
  prev as (select * from b where booked_on between v_prev_from and v_from - 1),
  reached as (
    select c.id,
           bool_or(c.status in ('contacted', 'confirmed', 'completed')
                   or e.meta ->> 'to' in ('contacted', 'confirmed', 'completed')) as contacted,
           bool_or(c.status in ('confirmed', 'completed')
                   or e.meta ->> 'to' in ('confirmed', 'completed'))              as confirmed,
           bool_or(c.status = 'completed' or e.meta ->> 'to' = 'completed')       as completed
    from cur c
    left join public.booking_events e on e.booking_id = c.id and e.kind = 'status'
    group by c.id
  ),
  first_touch as (
    select c.id, min(e.created_at) - c.created_at as wait
    from cur c
    join public.booking_events e on e.booking_id = c.id and e.kind = 'status' and e.meta ->> 'from' = 'new'
    group by c.id, c.created_at
  )
  select jsonb_build_object(
    'from',          v_from,
    'to',            v_today,
    'days',          v_days,
    'year',          v_year,
    'received',      (select count(*) from cur),
    'received_prev', (select count(*) from prev),
    'won',           (select count(*) from cur  where status in ('confirmed', 'completed')),
    'won_prev',      (select count(*) from prev where status in ('confirmed', 'completed')),
    'open',          (select count(*) from cur  where status in ('new', 'contacted', 'confirmed')),
    'cancelled',     (select count(*) from cur  where status = 'cancelled'),
    'website',       (select count(*) from cur  where source = 'website'),
    'jobs_done',     (select count(*) from b where status = 'completed' and service_date between v_from and v_today),
    'revenue',       (select coalesce(sum(quoted_amount), 0) from b
                       where status = 'completed' and service_date between v_from and v_today),
    'revenue_prev',  (select coalesce(sum(quoted_amount), 0) from b
                       where status = 'completed' and service_date between v_prev_from and v_from - 1),
    'responded',     (select count(*) from first_touch),
    'avg_response_minutes', (select round(extract(epoch from avg(wait)) / 60) from first_touch),
    'funnel', (
      select jsonb_build_object(
        'received',  count(*),
        'contacted', count(*) filter (where contacted),
        'confirmed', count(*) filter (where confirmed),
        'completed', count(*) filter (where completed))
      from reached),
    'services', (
      select coalesce(jsonb_agg(jsonb_build_object('service', service, 'count', n, 'revenue', rev) order by n desc, service), '[]'::jsonb)
      from (
        select service, count(*) as n, coalesce(sum(quoted_amount) filter (where status = 'completed'), 0) as rev
        from cur group by service
      ) s),
    'heatmap', (
      select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'slot', slot, 'count', n)), '[]'::jsonb)
      from (
        select extract(isodow from service_date)::integer as dow,
               coalesce(preferred_time, 'Flexible') as slot,
               count(*) as n
        from cur where service_date is not null
        group by 1, 2
      ) h),
    'monthly', (
      select jsonb_agg(jsonb_build_object(
               'month',     m,
               'completed', coalesce(x.completed, 0),
               'open',      coalesce(x.open, 0),
               'cancelled', coalesce(x.cancelled, 0),
               'revenue',   coalesce(x.revenue, 0)) order by m)
      from generate_series(1, 12) m
      left join (
        select extract(month from booked_on)::integer as mo,
               count(*) filter (where status = 'completed')                         as completed,
               count(*) filter (where status in ('new', 'contacted', 'confirmed'))  as open,
               count(*) filter (where status = 'cancelled')                         as cancelled,
               coalesce(sum(quoted_amount) filter (where status = 'completed'), 0)  as revenue
        from b where extract(year from booked_on) = v_year
        group by 1
      ) x on x.mo = m),
    'years', (
      select jsonb_agg(y order by y desc)
      from (
        select distinct extract(year from booked_on)::integer as y from b
        union
        select extract(year from v_today)::integer
      ) ys)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_analytics(integer, integer) from public, anon;
grant execute on function public.admin_analytics(integer, integer) to authenticated;

create or replace function public.set_my_username(p_username text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email    text := lower(auth.jwt() ->> 'email');
  v_username text := lower(regexp_replace(coalesce(p_username, ''), '[[:space:] ​‌‍⁠﻿]', '', 'g'));
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if v_username !~ '^[a-z0-9._-]{3,32}$' then
    raise exception 'Usernames are 3–32 letters, numbers, dots, dashes or underscores.' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_users where username = v_username and email <> v_email) then
    raise exception 'That username is already taken.' using errcode = '23505';
  end if;

  update public.admin_users set username = v_username where email = v_email;
  return v_username;
end;
$$;

revoke all on function public.set_my_username(text) from public, anon;
grant execute on function public.set_my_username(text) to authenticated;
