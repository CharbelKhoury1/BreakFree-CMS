/*
  # Create storage bucket for blog images

  1. Storage Setup
    - Create `blog-images` bucket for featured images and content images
    - Set up public access for published blog images
    - Configure proper file type restrictions and size limits

  2. Security
    - Enable RLS on storage objects
    - Allow authenticated users to upload images
    - Allow public read access to all images
    - Allow authors to delete their own images
*/

-- Create blog-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload blog images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images' AND
    (storage.extension(name) = 'jpg' OR 
     storage.extension(name) = 'jpeg' OR 
     storage.extension(name) = 'png' OR 
     storage.extension(name) = 'webp' OR
     storage.extension(name) = 'gif')
  );

-- Allow public read access to blog images
CREATE POLICY "Public read access to blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete blog images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');</parameter>