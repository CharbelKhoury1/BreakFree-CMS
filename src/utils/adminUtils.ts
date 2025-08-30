import { AuthService } from '../services/authService';
import type { Profile } from '../types/auth';

const authService = new AuthService();

/**
 * Utility function to fetch all users from the profiles table
 * @returns Promise<Profile[]> - Array of user profiles
 */
export const fetchAllUsers = async (): Promise<Profile[]> => {
  try {
    const allUsers = await authService.getAllUsers();
    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Example usage function that demonstrates how to use the user fetching functionality
 */
export async function exampleUsage() {
  try {
    // Fetch all users
    const users = await fetchAllUsers();
    
    // Log user details
    console.log('Users:', users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    })));
    
    return users;
  } catch (error) {
    console.error('Error in example usage:', error);
    return [];
  }
}