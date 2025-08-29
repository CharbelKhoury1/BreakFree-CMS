/*
  # Insert default admin user for testing

  1. Admin User Setup
    - Creates a test admin user account
    - Sets role to 'admin' for dashboard access
    - Password: admin123 (should be changed in production)

  Note: This is for development/testing purposes only.
  In production, create admin users through proper registration flow.
*/

-- Insert admin user profile (the auth user should be created through Supabase Auth)
-- This assumes the admin user will be created through the signup process
-- You can create the auth user manually in Supabase dashboard with:
-- Email: admin@breakfree.com
-- Password: admin123

-- Update this profile to admin role once the user is created
-- Replace 'your-admin-user-id' with the actual user ID from auth.users
DO $$
BEGIN
  -- Check if admin user exists and update role
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@breakfree.com'
  ) THEN
    UPDATE profiles 
    SET role = 'admin', full_name = 'Admin User'
    WHERE email = 'admin@breakfree.com';
  END IF;
END $$;</parameter>