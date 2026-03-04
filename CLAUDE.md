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

This is a **Next.js 15 App Router** project (TypeScript + Tailwind CSS 4) for "CD Smart Campus" — a Thai school student services platform.

### Key directories

- `app/` — All Next.js App Router pages and API routes
  - `app/components/` — Shared UI: `NavBar.tsx`, `components/UI/` (Footer, RippleEffect), `SportTable.tsx`
  - `app/home/` — Landing page with `sections/` subdirectory (hero, features, login)
  - `app/topics/` — Educational modules: `html-css/`, `javascript/`, `design-thinking/`, `figma/`
  - `app/application/` — Student application form page
  - `app/api/` — API routes (currently: `application/route.ts`)
- `utils/db.ts` — MySQL connection pool (used server-side only)
- `public/Fonts/` — Custom Thai fonts (Sukhumvit Set)

### Data layer

- MySQL via `mysql2/promise` pool in `utils/db.ts`
- Requires `MYSQL_URI` environment variable
- Google Drive image hosting is whitelisted in `next.config.ts`
- Vercel Analytics is integrated in the root layout

### UI stack

- **Tailwind CSS 4** for layout and utility styling
- **Material-UI (@mui/material)** for component library
- **Framer Motion** for animations
- **React Icons / Heroicons / Lucide React** for icons
- Thai font (Sukhumvit Set) loaded from `public/Fonts/`; English uses Geist via `next/font/google`

### API routes

API routes live at `app/api/<name>/route.ts`. The database pool (`utils/db.ts`) is imported server-side only — never import it in client components.
