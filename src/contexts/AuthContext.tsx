import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';
import type { Profile } from '../types/auth';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext.onAuthStateChange: Auth state changed', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id 
        });
        
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('🔄 AuthContext.onAuthStateChange: Loading user profile');
          await loadUserProfile(session.user.id);
        } else {
          console.log('🔄 AuthContext.onAuthStateChange: No session, clearing profile');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    console.log('👤 AuthContext.loadUserProfile: Loading profile for user', { userId });
    
    try {
      console.log('👤 AuthContext.loadUserProfile: Calling authService.getUserProfile');
      const userProfile = await authService.getUserProfile(userId);
      
      console.log('👤 AuthContext.loadUserProfile: Profile loaded successfully', { 
        profileId: userProfile.id, 
        email: userProfile.email, 
        role: userProfile.role 
      });
      
      setProfile(userProfile);
    } catch (error) {
      console.error('👤 AuthContext.loadUserProfile: Error loading profile', error);
      setProfile(null);
      // If profile loading fails, sign out the user
      console.log('👤 AuthContext.loadUserProfile: Signing out due to profile load failure');
      await authService.signOut();
    } finally {
      console.log('👤 AuthContext.loadUserProfile: Setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AuthContext.signIn: Starting sign in process', { email });
    setLoading(true);
    
    try {
      console.log('🔑 AuthContext.signIn: Calling authService.signIn');
      const response = await authService.signIn(email, password);
      
      console.log('🔑 AuthContext.signIn: AuthService response', { 
        hasUser: !!response.user, 
        hasSession: !!response.session, 
        hasError: !!response.error 
      });
      
      if (response.error) {
        console.error('🔑 AuthContext.signIn: Error in response', response.error);
        throw response.error;
      }
      
      console.log('🔑 AuthContext.signIn: Success, waiting for auth state change');
      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      console.error('🔑 AuthContext.signIn: Sign in failed', error);
      // Only set loading to false on error, successful auth will be handled by onAuthStateChange
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signOut,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}