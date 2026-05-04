/*
  # Travlog Schema Upgrade — Cost Breakdown, Difficulty, Photos, Likes

  1. Modified Tables
    - trip_logs: add transport_cost, food_cost, entry_fees, other_costs, difficulty, best_time columns
    - trip_logs: change total_cost to be auto-calculated or manually set

  2. New Tables
    - trip_likes: tracks which users liked which trips (user_id, trip_id unique pair)
    - trip_images: stores up to 5 image URLs per trip

  3. Security
    - RLS enabled on all new tables
    - trip_likes: owner can insert/delete their own likes, all can read
    - trip_images: all can read, trip owner can insert/delete
*/

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

-- trip_images table
CREATE TABLE IF NOT EXISTS trip_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trip_logs(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read trip_images"
  ON trip_images FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert own trip images"
  ON trip_images FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trip_logs WHERE trip_logs.id = trip_images.trip_id AND trip_logs.user_id = auth.uid()));

CREATE POLICY "Users can delete own trip images"
  ON trip_images FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_logs WHERE trip_logs.id = trip_images.trip_id AND trip_logs.user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_likes_trip_id ON trip_likes(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_likes_user_id ON trip_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_images_trip_id ON trip_images(trip_id);
