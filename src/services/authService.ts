import { supabase } from '../lib/supabase';
import type { Profile, AuthResponse, ProfileUpdate } from '../types/auth';
import type { Database } from '../types/database';

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      if (data.user) {
        const isUserAdmin = await this.isAdmin(data.user.id);
        if (!isUserAdmin) {
          await this.signOut();
          throw new Error('Access denied. Admin privileges required.');
        }
      }

      return { user: data.user, session: data.session };
    } catch (error) {
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as { data: Database['public']['Tables']['profiles']['Row'] | null, error: any };

      if (error || !data) return false;
      return data.role === 'admin';
    } catch {
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