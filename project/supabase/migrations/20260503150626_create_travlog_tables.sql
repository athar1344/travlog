/*
  # Create Travlog Tables

  1. New Tables
    - profiles: user profile data (full_name, avatar_url, bio, city, state)
    - trip_logs: travel experience logs with cost, route, hotel, etc.
    - comments: comments on trip logs

  2. Security
    - RLS enabled on all tables
    - Profiles: authenticated users can read all, owners can write their own
    - Trip logs: public read (anon + authenticated), owner can insert/update
    - Comments: public read, owner can insert
*/

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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trip_logs_user_id ON trip_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_logs_created_at ON trip_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_trip_id ON comments(trip_id);
