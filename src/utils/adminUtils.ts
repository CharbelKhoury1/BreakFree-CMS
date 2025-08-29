import { AuthService } from '../services/authService';
import type { Profile } from '../types/auth';

const authService = new AuthService();

/**
 * Utility function to fetch all admin users from the profiles table
 * @returns Promise<Profile[]> - Array of admin user profiles
 */
export async function fetchAdminUsers(): Promise<Profile[]> {
  try {
    const adminUsers = await authService.getAdminUsers();
    console.log('Admin users found:', adminUsers.length);
    return adminUsers;
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw error;
  }
}

/**
 * Example usage function that demonstrates how to use the admin fetching functionality
 */
export async function exampleUsage() {
  try {
    // Fetch all admin users
    const admins = await fetchAdminUsers();
    
    // Log admin details
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`, {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
        createdAt: admin.created_at
      });
    });
    
    return admins;
  } catch (error) {
    console.error('Error in example usage:', error);
    return [];
  }
}