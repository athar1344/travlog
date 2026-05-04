<div align="center">

# Travlog

### Your Friend Who Went There First

Honest trip logs with real costs, routes, and insider tips from fellow Indian travelers.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[Getting Started](#-getting-started) · [Features](#-key-features) · [Tech Stack](#-tech-stack) · [Database Setup](#-database-setup) · [Project Structure](#-project-structure)

</div>

---

## The Problem

Planning a trip in India means scrolling through sponsored hotel listings, outdated blogs, and generic itineraries that never mention the real cost of that mountain cab ride or the fact that the "scenic route" adds four hours of nausea. You ask a friend who just went there — and suddenly everything clicks. The real numbers. The honest warnings. The "skip this, do that instead."

**Travlog is that friend.**

## The Solution

Travlog is a community-driven travel log platform where real travelers share honest, detailed accounts of their trips — with actual costs broken down by category, routes that work, precautions that matter, and photos that show what to expect. No sponsors. No affiliate links. Just first-hand experience from someone who went there first.

---

## Key Features

- **Full Trip Logs** — Destination, state, date, description, route, hotel, language, and precautions all in one place
- **Cost Breakdown** — Transport, food, hotel, entry fees, and other costs listed separately with auto-calculated totals
- **Difficulty Ratings** — Easy / Moderate / Difficult / Expert badges with color coding
- **Best Time to Visit** — Seasonal badges (Oct-Feb, Mar-Jun, Jul-Sep, Year Round)
- **Photo Uploads** — Up to 5 photos per trip stored in Supabase Storage with swipeable gallery and lightbox
- **Like & Save** — Heart any trip to save it; view all saved trips on your profile
- **Comments** — Discuss trips with other travelers directly on the trip page
- **Verified Traveler Badge** — Users with 3+ trips earn a verified badge on their profile and trip cards
- **Edit & Delete** — Trip owners can edit all fields or delete their trips with confirmation
- **3D Card Tilt** — Trip cards respond to mouse position with perspective-based tilt effects
- **Animated Entrance** — Staggered slide-up animations, count-up cost numbers, and parallax hero images
- **Destinations Page** — Browse all states with trip counts; click to filter
- **Responsive Design** — Mobile hamburger menu, stacked layouts, and touch-friendly interactions
- **Auth** — Supabase email/password authentication with protected routes

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | UI framework |
| Build | Vite 5 | Dev server & bundler |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Icons | Lucide React | Icon library |
| Routing | React Router 7 | Client-side routing |
| Backend | Supabase | Auth, database, storage |
| Database | PostgreSQL (Supabase) | Data persistence |
| Storage | Supabase Storage | Trip image uploads |
| Auth | Supabase Auth | Email/password authentication |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) account and project

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/travlog.git
cd travlog

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard > Settings > API |

### Run the dev server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

---

## Database Setup

Run these migrations in order on your Supabase project using the SQL Editor or `supabase db push`:

### 1. Create Core Tables

<details>
<summary>20260503150626_create_travlog_tables.sql</summary>

```sql
-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT NULL,
  bio text DEFAULT NULL,
  city text DEFAULT NULL,
  state text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- TRIP_LOGS
CREATE TABLE IF NOT EXISTS trip_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_name text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  trip_date date NOT NULL,
  total_cost numeric NOT NULL DEFAULT 0,
  hotel_name text DEFAULT '',
  hotel_cost numeric DEFAULT 0,
  route_taken text DEFAULT '',
  language_spoken text DEFAULT '',
  precautions text DEFAULT '',
  description text DEFAULT '',
  cover_image_url text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read trip_logs"
  ON trip_logs FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert own trips"
  ON trip_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trip_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read comments"
  ON comments FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_logs_user_id ON trip_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_logs_created_at ON trip_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_trip_id ON comments(trip_id);
```

</details>

### 2. Schema Upgrade — Cost Breakdown, Difficulty, Likes

<details>
<summary>20260503153702_travlog_schema_upgrade.sql</summary>

```sql
-- Add new columns to trip_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_logs' AND column_name='transport_cost') THEN
    ALTER TABLE trip_logs ADD COLUMN transport_cost numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_logs' AND column_name='food_cost') THEN
    ALTER TABLE trip_logs ADD COLUMN food_cost numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_logs' AND column_name='entry_fees') THEN
    ALTER TABLE trip_logs ADD COLUMN entry_fees numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_logs' AND column_name='other_costs') THEN
    ALTER TABLE trip_logs ADD COLUMN other_costs numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_logs' AND column_name='difficulty') THEN
    ALTER TABLE trip_logs ADD COLUMN difficulty text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_logs' AND column_name='best_time') THEN
    ALTER TABLE trip_logs ADD COLUMN best_time text DEFAULT '';
  END IF;
END $$;

-- trip_likes table
CREATE TABLE IF NOT EXISTS trip_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES trip_logs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trip_id)
);

ALTER TABLE trip_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read trip_likes"
  ON trip_likes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert own likes"
  ON trip_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON trip_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_likes_trip_id ON trip_likes(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_likes_user_id ON trip_likes(user_id);
```

</details>

### 3. Storage Bucket & Policies

<details>
<summary>20260503153725_trip_images_storage_policy.sql</summary>

```sql
-- Create the trip-images bucket (run in SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-images', 'trip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public can view trip images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'trip-images');

-- Allow authenticated upload
CREATE POLICY "Authenticated can upload trip images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trip-images');

-- Allow authenticated delete
CREATE POLICY "Authenticated can delete trip images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'trip-images');
```

</details>

### 4. Add photo_urls Column

<details>
<summary>20260503160905_add_photo_urls_to_trip_logs.sql</summary>

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trip_logs' AND column_name = 'photo_urls'
  ) THEN
    ALTER TABLE trip_logs ADD COLUMN photo_urls text[] DEFAULT '{}';
  END IF;
END $$;
```

</details>

### Database Schema

```
profiles
  id          uuid    PK  REFERENCES auth.users(id)
  full_name   text
  avatar_url  text
  bio         text
  city        text
  state       text
  created_at  timestamptz

trip_logs
  id                uuid      PK
  user_id           uuid      FK  REFERENCES auth.users(id)
  destination_name  text
  state             text
  trip_date         date
  total_cost        numeric
  transport_cost    numeric
  food_cost         numeric
  hotel_cost        numeric
  entry_fees        numeric
  other_costs       numeric
  hotel_name        text
  route_taken       text
  language_spoken   text
  precautions       text
  description       text
  difficulty        text
  best_time         text
  cover_image_url   text
  photo_urls        text[]
  created_at        timestamptz

trip_likes
  id          uuid          PK
  user_id     uuid          FK  REFERENCES auth.users(id)
  trip_id     uuid          FK  REFERENCES trip_logs(id)
  created_at  timestamptz
  UNIQUE(user_id, trip_id)

comments
  id          uuid          PK
  trip_id     uuid          FK  REFERENCES trip_logs(id)
  user_id     uuid          FK  REFERENCES auth.users(id)
  content     text
  created_at  timestamptz
```

---

## Project Structure

```
travlog/
├── public/
├── src/
│   ├── components/
│   │   ├── Footer.tsx          # Site footer with links
│   │   ├── Navbar.tsx          # Sticky navbar with scroll effect
│   │   └── TripCard.tsx        # 3D tilt trip card with likes
│   ├── context/
│   │   └── AuthContext.tsx     # Supabase auth provider
│   ├── lib/
│   │   └── supabase.ts        # Client, types, and helpers
│   ├── pages/
│   │   ├── AboutPage.tsx      # Mission & how it works
│   │   ├── DestinationsPage.tsx # Browse by state
│   │   ├── HomePage.tsx        # Hero + trip feed
│   │   ├── LoginPage.tsx      # Sign in
│   │   ├── PostTripPage.tsx   # Create / edit trip form
│   │   ├── ProfilePage.tsx    # User profile + saved trips
│   │   ├── SignUpPage.tsx     # Register
│   │   └── ViewTripPage.tsx   # Full trip detail + comments
│   ├── App.tsx                # Routes & layout
│   ├── index.css              # Animations & global styles
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts
├── supabase/
│   └── migrations/            # SQL migrations (run in order)
├── .env                       # Environment variables
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Project Status

- [x] **Phase 1 — Core Platform** — Auth, trip CRUD, cost breakdown, difficulty/best-time badges, photo uploads, likes, comments, verified traveler, 3D cards, animations, edit/delete, destinations page, about page
- [ ] **Phase 2 — Social & Discovery** — Follow travelers, trip bookmarks/collections, search filters (by cost range, difficulty, season), trending trips, state-specific landing pages
- [ ] **Phase 3 — Mobile & Offline** — PWA support, offline reading, push notifications for new trips in saved states, share trip via link/image card

---

## Screenshots

> Screenshots coming soon — the app is actively in development.

| Page | Preview |
|------|---------|
| Homepage | *Hero with parallax, search bar, trip card grid* |
| Trip Detail | *Full cost breakdown, photo gallery, comments* |
| Post Trip | *Cost fields, difficulty dropdown, photo upload* |
| Profile | *Verified badge, saved trips tab, stats* |
| Destinations | *State cards with gradient backgrounds* |

---

## About

Travlog was born in the Yana Caves of Karnataka, India — standing inside those limestone formations, surrounded by the kind of raw beauty that no Instagram filter could improve, the idea hit: what if there was a place where travelers shared the *real* story? Not the polished highlight reel, but the actual cost of the bus from Bangalore, the name of the guesthouse that had hot water, the warning about the leeches on the monsoon trail.

That's Travlog. Your friend who went there first.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with care by travelers, for travelers.

**[Report a Bug](https://github.com/your-username/travlog/issues)** · **[Request a Feature](https://github.com/your-username/travlog/issues)** · **[Contribute](https://github.com/your-username/travlog/pulls)**

</div>
