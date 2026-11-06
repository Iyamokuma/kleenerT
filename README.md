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

Visitors can't read, edit or delete bookings. The website's key can only call `create_booking()`.

## Booking flow

Every "Book a service" button opens an animated, three-step modal (`src/components/booking/`):
**service → date, time & address → contact details → confirmation with reference**.
Any URL ending in `/#book` opens it directly. If Supabase isn't configured, the form falls back to a pre-filled email.

## Project layout

```
public/images/       photos taken from the company profile
src/components/      one component per page section
src/data/content.js  all site copy, services, clients and reviews
src/lib/supabase.js  Supabase client (reads the env vars above)
src/styles/          global design tokens and styles
supabase/            SQL to set up the database
```
