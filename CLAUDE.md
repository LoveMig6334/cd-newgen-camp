# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run production # Build then start (shortcut for deployment)
```

## Architecture

This is a **Next.js 15 App Router** project (TypeScript + Tailwind CSS 4) for "CD Smart Campus" — a Thai school student services platform supporting multi-year events.

### Key directories

- `app/` — All Next.js App Router pages and API routes
  - `app/components/` — Shared UI: `NavBar.tsx` (event-aware), `ApplicationForm.tsx`, `components/UI/` (Footer, RippleEffect)
  - `app/components/sections/` — Landing page sections: `hero/`, `features/`, `login/`
  - `app/events/[year]/[slug]/` — Event landing pages (dynamic by year + slug)
    - `page.tsx` — Event landing (Hero + Features + Login sections)
    - `application/page.tsx` — Application form (uses `ApplicationForm` component)
    - `topics/[topic]/page.tsx` — Topic pages
  - `app/events/2025/next-gen-web-academy/` — Static Next Gen Web Academy 2025 event
  - `app/admin/` — Admin panel (auth-protected)
    - `(protected)/` — Route group: dashboard, events, applicants (require login)
    - `login/` — Admin login page (public)
    - `components/LogoutButton.tsx` — Client logout button
  - `app/api/` — API routes
    - `application/route.ts` — Public: submit application to Supabase
    - `admin/events/route.ts` — Admin: CRUD for events table
    - `admin/applicants/route.ts` — Admin: read applications by event
- `lib/supabase/client.ts` — Browser Supabase client (`createBrowserClient`)
- `lib/supabase/server.ts` — Server Supabase client (`createServerClient` with cookies)
- `lib/types.ts` — Shared TypeScript types: `Event`, `Application`, `ApplicationFormData`
- `proxy.ts` — Auth middleware: protects `/admin/*`, redirects unauthenticated to `/admin/login`
- `public/Fonts/` — Custom Thai fonts (Sukhumvit Set)

### Data layer

- **Supabase** (PostgreSQL) via `@supabase/ssr` and `@supabase/supabase-js`
- Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Tables: `events`, `applications` (with RLS policies)
- Server-side: use `lib/supabase/server.ts` in Server Components, API routes, `proxy.ts`
- Client-side: use `lib/supabase/client.ts` in Client Components only
- Vercel Analytics is integrated in the root layout

### Auth

- Supabase Auth (email + password) for admin users
- `proxy.ts` protects all `/admin/*` routes except `/admin/login`
- `app/admin/(protected)/layout.tsx` provides secondary auth check + sidebar UI
- Create admin users via Supabase Dashboard → Authentication → Users

### UI stack

- **Tailwind CSS 4** for layout and utility styling
- **Material-UI (@mui/material)** for component library
- **Framer Motion** for animations
- **React Icons / Heroicons / Lucide React** for icons
- Thai font (Sukhumvit Set) loaded from `public/Fonts/`; English uses Geist via `next/font/google`

### API routes

API routes live at `app/api/<name>/route.ts`. Always use `lib/supabase/server.ts` server-side — never import it in client components. Admin API routes check `supabase.auth.getUser()` and return 401 if unauthenticated.
