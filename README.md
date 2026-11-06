# Kleener Touch — website

Marketing site for **Kleener Touch Facility Management Limited** (RC 8263558), built with React 18 + Vite and backed by Supabase.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev
```

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Local dev server with hot reload     |
| `npm run build`   | Production build into `dist/`        |
| `npm run preview` | Serve the production build locally   |

## Environment variables

| Name                                   | Where to find it                                   |
| -------------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase → Project Settings → API → Project URL    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key |

`VITE_` prefixes work too. Both values are public by design: the database's row-level security decides what they can do. **Never** put the `service_role` / secret key in this project.

Production builds read `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` from the committed `.env.production`. The code checks `VITE_` names before `NEXT_PUBLIC_` ones, so this file pins the site to project `rbcuvmqariirwqaczuey` even if Vercel has other `NEXT_PUBLIC_SUPABASE_*` values. To switch projects, edit this file (or set `VITE_` variables in Vercel).

## Deploy on Vercel

1. Vercel → **Add New… → Project** → import `Iyamokuma/kleenerT`.
2. Framework preset is detected as **Vite** (settings also live in `vercel.json`).
3. Add the two environment variables above for **Production** and **Preview**.
4. Deploy. Every push to `main` redeploys; every pull request gets a preview URL.

`vercel.json` adds SPA rewrites, long-lived caching for hashed assets, basic security headers and `noindex` on `/admin`.

## Database (Supabase)

Run the files in `supabase/migrations/` **in order** (Supabase → SQL Editor → New query → paste → Run).

| Migration | What it sets up |
| --- | --- |
| `…0001_bookings.sql` | `bookings` table, row-level security, and the public `create_booking()` function the booking form calls. It validates every field server-side, rate-limits by phone number and returns a reference such as `KT-261105-4F2A`. |
| `…0002_admin.sql` | Admin allow-list (`admin_users`), staff columns (assignee, confirmed date, quote), the `booking_events` activity log written by triggers, `admin_dashboard_stats()`, the `booking_customers` view and realtime on `bookings`. Seeds `booking.kleenertouch@gmail.com` as the first admin. |
| `…0003_forgiving_login.sql` | Makes the username lookup ignore case and stray or invisible spaces, and accept the part of an admin's email before the @ as a username. |
| `…0004_analytics_and_username.sql` | `admin_analytics(p_days, p_year)` for the overview (period figures with the previous period for comparison, pipeline from the activity log, time to first response, monthly outcomes, popular services, weekday × time-of-day demand) and `set_my_username()` so admins can change their own username. |

Visitors can't read, edit or delete bookings. The website's key can only call `create_booking()`. Signed-in users only see data if their **confirmed** email is on `admin_users`.

### Supabase Auth settings (once)

1. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up". Admin logins are created by hand.
2. **Authentication → URL Configuration**: set **Site URL** to the live domain and add `https://<your-domain>/admin` to **Redirect URLs** (used by "Forgot password").
3. **Authentication → Users**: the first admin is `booking.kleenertouch@gmail.com`, username **`osasofkleener`**. If the account isn't listed, use **Add user → Create new user** with **Auto Confirm User** ticked.

Admins sign in at `/admin` with their **username or email**. Usernames live in `admin_users.username`; they're set when adding an admin, and each admin can change their own in Settings.

## Booking flow

Every "Book a service" button opens an animated, three-step modal (`src/components/booking/`):
**service → date, time & address → contact details → confirmation with reference**.
Any URL ending in `/#book` opens it directly. If Supabase isn't configured, the form falls back to a pre-filled email.

## Admin dashboard (`/admin`)

Sign in with an admin login to manage everything behind the booking form:

| Page | What staff can do |
| --- | --- |
| **Overview** | Pick 7 days / 30 days / 90 days / 12 months: requests won (conversion), revenue against the previous period, requests received, average first response, share booked online, cancellation rate; monthly bookings stacked by outcome for any year (chart or table); popular services; pipeline funnel; busiest weekday × time of day; who needs a first call; what's coming up |
| **Bookings** | Filter by status and service, search name / phone / reference / address, sort, paginate, export CSV, log phone & WhatsApp bookings |
| **Booking drawer** | Call, WhatsApp or email the customer; move it through *new → contacted → confirmed → completed* (or cancel); set confirmed date & time, assignee and quote; internal notes; full activity history; delete |
| **Schedule** | Two-week agenda by service date, with a list of open bookings that are past their date |
| **Customers** | Everyone grouped by phone number with booking count, completed jobs and lifetime value |
| **Settings** | Change your username, change your password (current password required), add / remove admins, export all bookings |

New website bookings appear instantly (Supabase Realtime) with a notification, and the tab title shows how many are waiting. The dashboard is a separate bundle, so site visitors never download it.

UI libraries: [Motion](https://motion.dev) for animation (respects the device's reduce-motion setting), [NumberFlow](https://number-flow.barvian.me) for animated figures and [Lucide](https://lucide.dev) icons. Chart colours were checked for colour-blind separation; every chart also has a table or text equivalent.

## Project layout

```
public/images/       photos taken from the company profile
src/admin/           admin dashboard (auth, pages, data layer, styles)
src/components/      one component per page section
src/data/content.js  all site copy, services, clients and reviews
src/lib/supabase.js  Supabase client (reads the env vars above)
src/styles/          global design tokens and styles
supabase/            SQL to set up the database
```
