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

🌐 **Live Demo:** [travlog-eight-xi.vercel.app](https://travlog-eight-xi.vercel.app/)

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
| Deployment | Vercel | Hosting & CI/CD |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) account and project

### Installation

```bash
# Clone the repository
git clone https://github.com/athar1344/Travlog.git
cd Travlog

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

Run these in order on your Supabase project using the SQL Editor:

### 1. Initial Tables
- profiles, trip_logs, comments with RLS policies

### 2. Schema Upgrade
- transport_cost, food_cost, entry_fees, other_costs, difficulty, best_time columns
- trip_likes table

### 3. Storage Bucket
- trip-images public bucket with read/write policies

### 4. Photo URLs
- photo_urls text array column on trip_logs

Full SQL available in the `/supabase/migrations/` folder.

---

## Project Structure
travlog/
├── public/
├── src/
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── TripCard.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── DestinationsPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PostTripPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SignUpPage.tsx
│   │   └── ViewTripPage.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   └── migrations/
├── .env
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
---

## Project Status

- [x] **Phase 1 — Core Platform** — Auth, trip CRUD, cost breakdown, difficulty/best-time badges, photo uploads, likes, comments, verified traveler, 3D cards, animations, edit/delete, destinations page, about page
- [ ] **Phase 2 — Social & Discovery** — Follow travelers, search filters, trending trips, state-specific pages
- [ ] **Phase 3 — Mobile & Offline** — PWA support, offline reading, push notifications, share trip cards

---

## About

Travlog was born in the Yana Caves of Karnataka, India — standing inside those limestone formations, surrounded by raw beauty that no Instagram filter could improve, the idea hit: what if there was a place where travelers shared the real story? Not the polished highlight reel, but the actual cost of the bus from Bangalore, the name of the guesthouse that had hot water, the warning about the leeches on the monsoon trail.

That's Travlog. Your friend who went there first.

---

## License

This project is licensed under the MIT License.

---

<div align="center">

Built with care by travelers, for travelers.

**[Report a Bug](https://github.com/athar1344/Travlog/issues)** · **[Request a Feature](https://github.com/athar1344/Travlog/issues)** · **[Contribute](https://github.com/athar1344/Travlog/pulls)**

</div>
