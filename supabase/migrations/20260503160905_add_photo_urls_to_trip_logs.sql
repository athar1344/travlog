/*
  # Add photo_urls column to trip_logs

  1. Add photo_urls text[] column to store up to 5 image URLs per trip
  2. This replaces the trip_images join approach to avoid 400 errors from Supabase schema cache
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trip_logs' AND column_name = 'photo_urls'
  ) THEN
    ALTER TABLE trip_logs ADD COLUMN photo_urls text[] DEFAULT '{}';
  END IF;
END $$;
