import { supabase } from '../lib/supabase';
import type { Profile, AuthResponse, ProfileUpdate } from '../types/auth';
import type { Database } from '../types/database';
import { withTimeout, ConnectionError, TimeoutError, AuthenticationError } from '../utils/timeout';

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 AuthService.signIn: Starting authentication process', { email });
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new AuthenticationError('Email and password are required');
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AuthenticationError('Please enter a valid email address');
      }
      
      console.log('🔐 AuthService.signIn: Calling Supabase auth.signInWithPassword with timeout');
      
      // Add timeout to prevent infinite loading
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await withTimeout(
        authPromise,
        15000, // 15 second timeout for better reliability
        'Authentication request timed out. Please check your connection and try again.'
      );

      console.log('🔐 AuthService.signIn: Supabase response', { 
        hasUser: !!data.user, 
        hasSession: !!data.session, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('🔐 AuthService.signIn: Supabase authentication error', error);
        
        // Handle specific error types
        if (error.message?.includes('Invalid login credentials')) {
          throw new AuthenticationError('Invalid email or password. Please check your credentials and try again.');
        }
        
        if (error.message?.includes('Email not confirmed')) {
          throw new AuthenticationError('Please check your email and click the confirmation link before signing in.');
        }
        
        if (error.message?.includes('Too many requests')) {
          throw new AuthenticationError('Too many login attempts. Please wait a few minutes before trying again.');
        }
        
        if (error.message?.includes('connection') || error.message?.includes('network')) {
          throw new ConnectionError('Unable to connect to authentication service. Please check your internet connection.');
        }
        
        if (error.message?.includes('User not found')) {
          throw new AuthenticationError('No account found with this email address. Please check your email or create an account.');
        }
        
        throw new AuthenticationError(error.message || 'Authentication failed. Please try again.');
      }

      if (!data.user) {
        console.error('🔐 AuthService.signIn: No user data received from Supabase');
        throw new AuthenticationError('Authentication failed. No user data received.');
      }
      
      if (!data.session) {
        console.error('🔐 AuthService.signIn: No session data received from Supabase');
        throw new AuthenticationError('Authentication failed. No session created.');
      }

      console.log('🔐 AuthService.signIn: Authentication completed successfully');
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('🔐 AuthService.signIn: Authentication failed', error);
      
      // Re-throw custom errors as-is
      if (error instanceof TimeoutError || error instanceof ConnectionError || error instanceof AuthenticationError) {
        return { user: null, session: null, error };
      }
      
      // Handle unexpected errors
      const authError = new AuthenticationError(
        error instanceof Error ? error.message : 'An unexpected error occurred during authentication.'
      );
      return { user: null, session: null, error: authError };
    }
  }

  async signOut(): Promise<void> {
    console.log('🔐 AuthService.signOut: Starting Supabase sign out');
    
    try {
      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('🔐 AuthService.signOut: Supabase error:', error);
        
        // Don't throw error for certain non-critical cases
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('invalid_token')) {
          console.warn('🔐 AuthService.signOut: Session already invalid, continuing with local cleanup');
          return;
        }
        
        throw error;
      }
      
      console.log('🔐 AuthService.signOut: Successfully signed out from Supabase');
    } catch (error) {
      console.error('🔐 AuthService.signOut: Failed to sign out from Supabase:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getUserProfile(userId: string): Promise<Profile> {
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single() as Promise<{ data: Database['public']['Tables']['profiles']['Row'] | null, error: any }>;
      
      const { data, error } = await withTimeout(
        profilePromise,
        15000, // Increased to 15 second timeout
        'Failed to load user profile. Please check your connection and try again.'
      );

      if (error) {
        console.error('🔐 AuthService.getUserProfile: Database error', error);
        
        if (error.message?.includes('connection') || error.message?.includes('network') || error.message?.includes('timeout')) {
          throw new ConnectionError('Unable to connect to user profile service. Please check your internet connection and try again.');
        }
        
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          throw new Error('Access denied. Please ensure you have permission to access this profile.');
        }
        
        throw new Error(`Profile lookup failed: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('User profile not found. Please contact support if this issue persists.');
      }
      
      console.log('🔐 AuthService.getUserProfile: Profile loaded successfully', { userId, role: data.role });
      return data as Profile;
    } catch (error) {
      console.error('🔐 AuthService.getUserProfile: Error occurred', error);
      
      if (error instanceof TimeoutError || error instanceof ConnectionError) {
        throw error;
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to load user profile. Please try again.');
    }
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single() as { data: Database['public']['Tables']['profiles']['Row'] | null, error: any };

    if (error) throw error;
    return data as Profile;
  }

  // Admin-specific methods removed - system now supports all authenticated users
  
  async getAllUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .order('created_at', { ascending: false }) as { data: Database['public']['Tables']['profiles']['Row'][] | null, error: any };

      if (error) throw error;
      return (data || []) as Profile[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}