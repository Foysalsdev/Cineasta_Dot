# Cineasta Dot Insight

Internal production-budgeting & profitability ERP for Cineasta Dot.
React + TypeScript + Vite, connected directly to Supabase (Auth + Postgres + RLS).

## Run locally

1. Install Node.js 18+ (https://nodejs.org)
2. In this folder, run:

   npm install
   npm run dev

3. Open the URL it prints (usually http://localhost:5173)

## Environment

`.env` already contains your Supabase project URL and publishable key.
The publishable key is safe to expose in the frontend — your data is protected
by Row Level Security (RLS) policies in the database.

## Login

Use your Supabase Auth email. If you don't know your password, click
"Sign in with a magic link instead" on the login page to get a link by email.

(Note: Email / Magic Link sign-in must be enabled in your Supabase dashboard
under Authentication → Providers.)

## What's built so far (Phase 2)

- Supabase client + Auth (password + magic link)
- Theme system (Light / Dark toggle, plain neutral backgrounds)
- Sidebar (auto-hides modules you don't have permission to view)
- Dashboard with live project pipeline counts
- All other modules are placeholders — built next, one at a time

## Project structure

src/
  lib/supabase.ts        Supabase client
  context/               Theme + Auth (session, profile, permissions)
  components/layout/      Sidebar, Topbar, AppLayout
  components/ui/          Reusable UI (Panel)
  pages/                  Dashboard, Login, placeholders
  types/                  TypeScript domain types
