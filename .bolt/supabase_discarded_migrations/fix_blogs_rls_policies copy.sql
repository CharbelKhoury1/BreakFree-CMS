-- Fix RLS policies for blogs table
-- This migration ensures proper RLS policies are in place for blog operations

-- Enable RLS on blogs table if not already enabled
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all published blogs" ON blogs;
DROP POLICY IF EXISTS "Users can view their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can insert their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can update their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can delete their own blogs" ON blogs;
DROP POLICY IF EXISTS "Allow public read access to published blogs" ON blogs;
DROP POLICY IF EXISTS "Allow authenticated users to manage their blogs" ON blogs;

-- Create comprehensive RLS policies

-- Allow public read access to published blogs
CREATE POLICY "Allow public read access to published blogs" ON blogs
FOR SELECT TO public
USING (published = true);

-- Allow authenticated users to view all blogs (for admin dashboard)
CREATE POLICY "Allow authenticated users to view all blogs" ON blogs
FOR SELECT TO authenticated
USING (true);

-- Allow authenticated users to insert their own blogs
CREATE POLICY "Allow authenticated users to insert blogs" ON blogs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow authenticated users to update their own blogs
CREATE POLICY "Allow authenticated users to update their blogs" ON blogs
FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Allow authenticated users to delete their own blogs
CREATE POLICY "Allow authenticated users to delete their blogs" ON blogs
FOR DELETE TO authenticated
USING (auth.uid() = author_id);

-- Grant necessary permissions to authenticated role
GRANT ALL PRIVILEGES ON blogs TO authenticated;
GRANT ALL PRIVILEGES ON blogs TO anon;

-- Ensure the profiles table has proper policies too
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create profile policies
CREATE POLICY "Allow users to view their own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant permissions on profiles
GRANT ALL PRIVILEGES ON profiles TO authenticated;