# CD Smart Campus

**แพลตฟอร์มจัดการกิจกรรมค่ายและรับสมัครนักเรียนออนไลน์**

CD Smart Campus is a multi-year event management platform for Thai schools — featuring dynamic event landing pages, an online application form, and an admin panel for managing events and applicants.

## 🎯 Project Purpose

- **Event Landing Pages**: Dynamic per-year/per-event pages showcasing camp details
- **Online Applications**: Students submit applications stored directly in Supabase
- **Admin Panel**: Auth-protected dashboard for managing events and viewing applicants

## ✨ Features

- Dynamic root redirect to the currently active event
- Event application form with full validation → saved to Supabase
- Admin panel (login, dashboard stats, event CRUD, applicant viewer with CSV export)
- Supabase Auth for admin users (email + password)
- Multi-year event architecture — add new events without code changes

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.2.3 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Animations | Framer Motion |
| UI Components | Material-UI |
| Icons | React Icons, Heroicons, Lucide React |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with `events` and `applications` tables

### Installation

```bash
git clone https://github.com/Theerat22/cdsc.git
cd cdsc
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cdsc/
├── app/
│   ├── components/              # Shared UI
│   │   ├── NavBar.tsx           # Event-aware navigation
│   │   ├── ApplicationForm.tsx  # Student application form
│   │   ├── sections/            # Landing page sections (hero, features, login)
│   │   └── UI/                  # Footer, RippleEffect
│   ├── events/
│   │   ├── [year]/[slug]/       # Dynamic event pages
│   │   └── 2025/next-gen-web-academy/  # Next Gen Web Academy 2025
│   ├── admin/
│   │   ├── (protected)/         # Auth-protected: dashboard, events, applicants
│   │   ├── login/               # Admin login page
│   │   └── components/          # LogoutButton
│   ├── api/
│   │   ├── application/         # Public: submit application
│   │   ├── admin/events/        # Admin: event CRUD
│   │   └── admin/applicants/    # Admin: read applicants
│   ├── page.tsx                 # Root: redirects to active event
│   └── layout.tsx               # Root layout
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client
│   └── types.ts                 # Event, Application types
├── middleware.ts                 # Protects /admin/* routes
└── public/Fonts/                # Sukhumvit Set (Thai font)
```

## 🗄 Database Schema

```sql
-- Events table
events (id, name, year, slug, description, is_active, max_applicants, created_at, updated_at)

-- Applications table
applications (id, event_id, first_name, last_name, email, phone, school, grade, reason, expectations, how_did_you_hear, created_at)
```

## 🔐 Admin Setup

1. Run RLS policies in Supabase SQL Editor:
```sql
CREATE POLICY "Authenticated users can manage events" ON events
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read applications" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');
```

2. Create an admin user: Supabase Dashboard → Authentication → Users → Add user

3. Visit `/admin` — login with your credentials

## 📜 Available Scripts

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run production # Build then start
```

## 📄 License

This project is part of the CD Smart Campus initiative. All rights reserved.

---

**Built for CDS**
