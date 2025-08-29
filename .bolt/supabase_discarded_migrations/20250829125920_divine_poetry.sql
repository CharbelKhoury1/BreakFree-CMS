/*
  # Create blogs table

  1. New Tables
    - `blogs`
      - `id` (uuid, primary key)
      - `title` (text) - blog post title
      - `content` (text) - blog post content (HTML)
      - `excerpt` (text) - short description
      - `slug` (text, unique) - URL-friendly identifier
      - `author_id` (uuid) - foreign key to profiles
      - `published` (boolean) - publication status
      - `featured_image` (text) - image URL
      - `tags` (text array) - categorization tags
      - `meta_title` (text) - SEO title
      - `meta_description` (text) - SEO description
      - `view_count` (integer) - number of views
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `blogs` table
    - Add policies for CRUD operations based on user roles
    - Authors can manage their own posts, admins can manage all posts

  3. Functions
    - Function to increment view count safely
    - Function to generate unique slugs
*/

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  slug text UNIQUE NOT NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  published boolean DEFAULT false,
  featured_image text,
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blogs_author_id_idx ON blogs(author_id);
CREATE INDEX IF NOT EXISTS blogs_published_idx ON blogs(published);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_tags_idx ON blogs USING gin(tags);

-- RLS Policies

-- Anyone can read published blogs
CREATE POLICY "Anyone can read published blogs"
  ON blogs
  FOR SELECT
  USING (published = true);

-- Authenticated users can read all blogs (for admin dashboard)
CREATE POLICY "Authenticated users can read all blogs"
  ON blogs
  FOR SELECT
  TO authenticated
  USING (true);

-- Authors can create their own blogs
CREATE POLICY "Authors can create blogs"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own blogs, admins can update any blog
CREATE POLICY "Authors and admins can update blogs"
  ON blogs
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authors can delete their own blogs, admins can delete any blog
CREATE POLICY "Authors and admins can delete blogs"
  ON blogs
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for blogs table to update timestamps
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to safely increment blog views
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE blogs 
  SET view_count = view_count + 1 
  WHERE id = blog_id AND published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  new_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  WHILE EXISTS (SELECT 1 FROM blogs WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;</parameter>