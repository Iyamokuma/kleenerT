-- Kleener Touch: make the admin sign-in lookup forgiving.
--
-- A username now matches regardless of case and of any whitespace in it,
-- including the invisible characters that sneak in when a username is copied
-- from WhatsApp or a chat window. The part of an admin's email before the @
-- (e.g. "booking.kleenertouch") also works as a username.
-- A password is still required, so this widens what's typed, not who gets in.

create or replace function public.admin_login_email(p_login text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  with v as (
    select lower(regexp_replace(
      coalesce(p_login, ''),
      '[[:space:] ​‌‍⁠﻿]', '', 'g'
    )) as login
  )
  select case
    when v.login = '' then null
    when position('@' in v.login) > 0 then v.login
    else (
      select a.email
      from public.admin_users a
      where a.username = v.login or split_part(a.email, '@', 1) = v.login
      order by (a.username is not distinct from v.login) desc, a.email
      limit 1
    )
  end
  from v;
$$;

revoke all on function public.admin_login_email(text) from public;
grant execute on function public.admin_login_email(text) to anon, authenticated;
