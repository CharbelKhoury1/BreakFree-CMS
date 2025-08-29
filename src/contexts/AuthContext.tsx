import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getConnectionStatus, testSupabaseConnection } from '../lib/supabase';
import { AuthService } from '../services/authService';
import type { Profile } from '../types/auth';
import { withTimeout, ConnectionError, TimeoutError, AuthenticationError } from '../utils/timeout';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  connectionStatus: { auth: boolean; database: boolean; lastChecked: number };
  testConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TEMPORARY: Bypass authentication for development
  // TODO: Remove this bypass and restore normal authentication flow
  const [user, setUser] = useState<any | null>({
    id: 'temp-user-id',
    email: 'admin@breakfree.com',
    role: 'admin'
  });
  const [profile, setProfile] = useState<Profile | null>({
    id: 'temp-user-id',
    email: 'admin@breakfree.com',
    full_name: 'Admin User',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false); // Set to false to skip loading
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());

  const isAdmin = true; // TEMPORARY: Always allow admin access

  useEffect(() => {
    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthContext: Initializing authentication');
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await withTimeout(
          sessionPromise,
          8000, // 8 second timeout for initial session
          'Failed to initialize authentication session'
        );
        
        console.log('🔄 AuthContext: Initial session loaded', { hasSession: !!session, hasUser: !!session?.user });
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('🔄 AuthContext: Failed to initialize auth', error);
        
        if (error instanceof TimeoutError || error instanceof ConnectionError) {
          console.warn('🔄 AuthContext: Connection issue during initialization, continuing without auth');
        }
        
        // Always ensure loading is set to false
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };
    
    initializeAuth();

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
      
      // Handle specific error types
      if (error instanceof ConnectionError || error instanceof TimeoutError) {
        console.warn('👤 AuthContext.loadUserProfile: Connection/timeout error, will retry later');
        // Don't clear user session for connection errors, just clear profile
        setProfile(null);
      } else {
        console.error('👤 AuthContext.loadUserProfile: Profile error, clearing session');
        // For other errors, clear both profile and user
        setProfile(null);
        setUser(null);
      }
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
        setLoading(false); // Reset loading state on error
        throw response.error;
      }
      
      console.log('🔑 AuthContext.signIn: Success, waiting for auth state change');
      
      // Add a safety timeout to prevent infinite loading
      setTimeout(() => {
        if (loading) {
          console.warn('🔑 AuthContext.signIn: Auth state change timeout, forcing loading to false');
          setLoading(false);
        }
      }, 5000); // 5 second safety timeout
      
      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      console.error('🔑 AuthContext.signIn: Sign in failed', error);
      setLoading(false); // Always reset loading state on error
      
      // Enhance error messages for better user experience
      if (error instanceof ConnectionError) {
        throw new Error('Unable to connect to the authentication service. Please check your internet connection and try again.');
      }
      
      if (error instanceof TimeoutError) {
        throw new Error('The login request timed out. Please check your connection and try again.');
      }
      
      if (error instanceof AuthenticationError) {
        throw error; // Pass through authentication errors as-is
      }
      
      // Handle other errors
      throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred during login.');
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

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(getConnectionStatus());
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const testConnection = async () => {
    await testSupabaseConnection();
    setConnectionStatus(getConnectionStatus());
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signOut,
      isAdmin,
      connectionStatus,
      testConnection,
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