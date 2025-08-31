/*
  # Fix Authentication Issues

  1. Profile Management
    - Ensure profiles table has proper constraints
    - Fix RLS policies for profile access
    - Add proper indexes for performance

  2. Authentication Functions
    - Update handle_new_user function
    - Add admin user creation helper
    - Fix profile creation triggers

  3. Security Policies
    - Review and fix RLS policies
    - Ensure admin users can access profiles
    - Add proper error handling
*/

-- Ensure the handle_new_user function exists and works correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (uid() = id)
  WITH CHECK (uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (uid() = id) OR 
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = uid() AND role = 'admin'
      )
    )
  )
  WITH CHECK (
    (uid() = id) OR 
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add helpful function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to safely create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_full_name text DEFAULT 'Admin User'
)
RETURNS json AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- This function should be called from the Supabase dashboard or via service role
  -- It cannot create auth users directly from SQL
  
  -- Check if user already exists in profiles
  IF EXISTS (SELECT 1 FROM profiles WHERE email = user_email) THEN
    -- Update existing user to admin
    UPDATE profiles 
    SET role = 'admin', full_name = user_full_name, updated_at = now()
    WHERE email = user_email;
    
    SELECT json_build_object(
      'success', true,
      'message', 'User updated to admin role',
      'email', user_email
    ) INTO result;
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'User not found. Please create the user in Supabase Auth first, then run this function.',
      'email', user_email
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();