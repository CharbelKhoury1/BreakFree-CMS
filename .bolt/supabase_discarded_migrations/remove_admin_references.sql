/*
  # Remove Admin-Specific References

  1. Remove admin-specific functions
  2. Update RLS policies to be role-agnostic
  3. Simplify user management
*/

-- Drop admin-specific functions
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS create_admin_user(text, text, text);

-- Update RLS policies to remove admin-specific logic
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create simplified profile management policy
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow all authenticated users to view profiles (for user management features)
CREATE POLICY "Authenticated users can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Update the comment in the other migration file
COMMENT ON POLICY "Users can view all profiles" ON profiles IS 'Allow authenticated users to view all profiles for user management features';