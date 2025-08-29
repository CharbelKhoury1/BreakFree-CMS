import { supabase } from '../lib/supabase';
import type { Profile, AuthResponse, ProfileUpdate } from '../types/auth';
import type { Database } from '../types/database';

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 AuthService.signIn: Starting authentication process', { email });
    
    try {
      console.log('🔐 AuthService.signIn: Calling Supabase auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 AuthService.signIn: Supabase response', { 
        hasUser: !!data.user, 
        hasSession: !!data.session, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('🔐 AuthService.signIn: Supabase authentication error', error);
        throw error;
      }

      // Check if user is admin
      if (data.user) {
        console.log('🔐 AuthService.signIn: User authenticated, checking admin status', { userId: data.user.id });
        const isUserAdmin = await this.isAdmin(data.user.id);
        console.log('🔐 AuthService.signIn: Admin check result', { isUserAdmin });
        
        if (!isUserAdmin) {
          console.warn('🔐 AuthService.signIn: User is not admin, signing out');
          await this.signOut();
          throw new Error('Access denied. Admin privileges required.');
        }
        
        console.log('🔐 AuthService.signIn: Admin verification successful');
      } else {
        console.error('🔐 AuthService.signIn: No user data received from Supabase');
      }

      console.log('🔐 AuthService.signIn: Authentication completed successfully');
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('🔐 AuthService.signIn: Authentication failed', error);
      return { user: null, session: null, error };
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getUserProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as { data: Database['public']['Tables']['profiles']['Row'] | null, error: any };

    if (error) throw error;
    return data as Profile;
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

  async isAdmin(userId: string): Promise<boolean> {
    console.log('👤 AuthService.isAdmin: Checking admin status for user', { userId });
    
    try {
      console.log('👤 AuthService.isAdmin: Querying profiles table');
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as { data: Database['public']['Tables']['profiles']['Row'] | null, error: any };

      console.log('👤 AuthService.isAdmin: Profile query result', { 
        hasData: !!data, 
        hasError: !!error, 
        errorMessage: error?.message,
        role: data?.role 
      });

      if (error || !data) {
        console.warn('👤 AuthService.isAdmin: No profile found or error occurred', { error });
        return false;
      }
      
      const isAdmin = data.role === 'admin';
      console.log('👤 AuthService.isAdmin: Final result', { isAdmin, role: data.role });
      return isAdmin;
    } catch (error) {
      console.error('👤 AuthService.isAdmin: Exception occurred', error);
      return false;
    }
  }

  async getAdminUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false }) as { data: Database['public']['Tables']['profiles']['Row'][] | null, error: any };

      if (error) throw error;
      return (data || []) as Profile[];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }
}