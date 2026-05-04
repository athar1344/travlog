/*
  # Storage Policy for trip-images bucket

  1. Allow authenticated users to upload images
  2. Allow public read access to images
  3. Allow users to delete their own uploaded images
*/

-- Allow public read
CREATE POLICY "Public can view trip images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'trip-images');

-- Allow authenticated upload
CREATE POLICY "Authenticated can upload trip images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trip-images');

-- Allow authenticated delete (owner check via app layer)
CREATE POLICY "Authenticated can delete trip images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'trip-images');
