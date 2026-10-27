# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm test           # Node test runner (scripts/*.test.mjs)
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
    - `prompt-battle/route.ts` — Public: Prompt Battle submission (multipart: participant, prompt, HTML file or pasted HTML)
  - `app/events/2026/next-gen-ai-academy/prompt-battle/` — Prompt Battle submit page (`/prompt-battle` redirects here)
  - `app/admin/(protected)/prompt-battle/` — TA gallery + view/compare page; student HTML is rendered only via `SandboxedHtml` (`<iframe sandbox="allow-scripts" srcdoc>`)
  - `app/admin/(protected)/pitch/` — Prototype PITCH (submissions closed; `lib/pitch.ts`) gallery + per-student presenter view; sketches served by `app/api/admin/pitch/sketch/[id]` (type from magic bytes)
  - `app/events/2026/next-gen-ai-academy/final-project/` + `app/api/final-project/` — Final Project submit: deployed link + pitch deck PDF (`/final` and `/pitch` redirect here); validation in `lib/finalProject.ts`. The PDF is uploaded from the browser straight to the private Storage bucket `final-project-decks`; the API only receives its path
  - `app/admin/(protected)/final-project/` — Final Project gallery + presenter view (deck via signed Storage URL, deployed site in a sandboxed iframe)
  - `app/admin/(protected)/wheel/` — random picker wheel (`/wheel`); "submitted" = has a Final Project; math in `lib/wheel.ts`, state in localStorage
  - `app/admin/(protected)/chaser/` — host-run "Chaser" quiz game (`/chaser`); rules as a pure reducer in `lib/chaser.ts` (tested), sample bank in `lib/chaserQuestions.ts`, Web Audio effects in `sounds.ts`; settings + question bank in localStorage
    - `chaser/display/` — audience screen (`/chaser/display`), opened from the host page; mirrors it via `sync.ts` — BroadcastChannel (same browser) plus Supabase Realtime Broadcast on `chaser:<room>` (any device; 6-char room code kept in localStorage on the host, display joins with `?room=CODE` or by typing it; clock-only updates throttled to 5/s) — and receives `toDisplayState()` — never the answers. Sound plays on the display when it's open with sound on, otherwise on the host
- `lib/supabase/client.ts` — Browser Supabase client (`createBrowserClient`)
- `lib/supabase/server.ts` — Server Supabase client (`createServerClient` with cookies)
- `lib/types.ts` — Shared TypeScript types: `Event`, `Application`, `ApplicationFormData`
- `lib/promptBattle.ts` — Prompt Battle limits + server-side validation (tested by `npm test`, `scripts/*.test.mjs`)
- `lib/eventRules.ts` — Per-event application rules not stored in DB (allowed grades per `year/slug`); used by the form and `/api/application`
- `proxy.ts` — Auth middleware: protects `/admin/*`, redirects unauthenticated to `/admin/login`
- `public/Fonts/` — Custom Thai fonts (Sukhumvit Set)

### Data layer

- **Supabase** (PostgreSQL) via `@supabase/ssr` and `@supabase/supabase-js`
- Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Tables: `events`, `applications`, `prompt_battle_submissions` (with RLS policies). Anon reads/writes Prompt Battle data only through the `prompt_battle_participants()` / `submit_prompt_battle()` SECURITY DEFINER functions (`supabase/migrations/20261020090000_prompt_battle.sql`)
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

API routes live at `app/api/<name>/route.ts`. Always use `lib/supabase/server.ts` server-side — never import it in client components. Admin API routes check `supabase.auth.getUser()` and return 401 if unauthenticated. `/api/application` enforces `is_active`, allowed grades (`lib/eventRules.ts`) and `max_applicants` via the `count_applications` SQL function (see README).
