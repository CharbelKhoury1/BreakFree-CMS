import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getConnectionStatus, testSupabaseConnection } from '../lib/supabase';
import { AuthService } from '../services/authService';
import type { Profile } from '../types/auth';
import { withTimeout, ConnectionError, TimeoutError, AuthenticationError } from '../utils/timeout';
import { isDevelopmentMode, mockData } from '../utils/developmentMode';

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
  const [user, setUser] = useState<any | null>(isDevelopmentMode() ? mockData.user : null);
  const [profile, setProfile] = useState<Profile | null>(isDevelopmentMode() ? mockData.profile : null);
  const [loading, setLoading] = useState(isDevelopmentMode() ? false : true);
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());

  const isAdmin = profile?.role === 'admin'; // Check actual user role

  useEffect(() => {
    // Skip real authentication if development bypass is enabled
    if (isDevelopmentMode()) {
      console.log('🔄 AuthContext: Development bypass enabled, skipping real authentication');
      // Don't initialize any real authentication when bypass is enabled
      return;
    }

    // Retry configuration for auth initialization
    const retryAuthInit = async (retries: number = 3, delay: number = 2000): Promise<void> => {
      try {
        console.log('🔄 AuthContext: Initializing authentication', { retriesLeft: retries });
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await withTimeout(
          sessionPromise,
          20000, // 20 second timeout for initial session
          'Failed to initialize authentication session - connection timeout'
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
        
        if ((error instanceof TimeoutError || error instanceof ConnectionError) && retries > 0) {
          console.warn(`🔄 AuthContext: Connection issue, retrying in ${delay}ms... (${retries} retries left)`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryAuthInit(retries - 1, Math.min(delay * 1.5, 10000));
        }
        
        console.warn('🔄 AuthContext: All retry attempts failed, continuing without auth');
        
        // Always ensure loading is set to false
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };
    
    // Get initial session with retry logic
    const initializeAuth = async () => {
      await retryAuthInit();
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

  const loadUserProfile = async (userId: string, retries: number = 2) => {
    console.log('👤 AuthContext.loadUserProfile: Loading profile for user', { userId, retriesLeft: retries });
    
    // Skip real profile loading if development bypass is enabled
    if (isDevelopmentMode()) {
      console.log('👤 AuthContext.loadUserProfile: Development bypass enabled, skipping real profile loading');
      setLoading(false);
      return;
    }
    
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
      if ((error instanceof ConnectionError || error instanceof TimeoutError) && retries > 0) {
        console.warn(`👤 AuthContext.loadUserProfile: Connection/timeout error, retrying in 3 seconds... (${retries} retries left)`);
        
        // Retry after a delay
        setTimeout(() => {
          loadUserProfile(userId, retries - 1);
        }, 3000);
        
        return; // Don't set loading to false yet
      } else if (error instanceof ConnectionError || error instanceof TimeoutError) {
        console.warn('👤 AuthContext.loadUserProfile: All retries failed, continuing without profile');
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
    
    // Handle development bypass
    if (isDevelopmentMode()) {
      console.log('🔑 AuthContext.signIn: Development bypass enabled, simulating successful login');
      setLoading(false);
      return;
    }
    
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
      
      // Check if user has admin role after successful authentication
      if (response.user) {
        console.log('🔑 AuthContext.signIn: Checking user role');
        try {
          const userProfile = await authService.getUserProfile(response.user.id);
          console.log('🔑 AuthContext.signIn: User profile loaded', { role: userProfile.role });
          
          if (userProfile.role !== 'admin') {
            console.warn('🔑 AuthContext.signIn: Non-admin user attempted to access CMS', { 
              email, 
              role: userProfile.role 
            });
            
            // Sign out the user immediately
            await authService.signOut();
            setLoading(false);
            
            throw new Error('Access denied. This system is restricted to administrators only. Please contact your system administrator if you believe this is an error.');
          }
        } catch (profileError) {
          console.error('🔑 AuthContext.signIn: Error loading user profile for role check', profileError);
          
          // If we can't load the profile, deny access for security
          await authService.signOut();
          setLoading(false);
          
          throw new Error('Unable to verify user permissions. Access denied for security reasons.');
        }
      }
      
      console.log('🔑 AuthContext.signIn: Admin user verified, proceeding with login');
      
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
    console.log('🔑 AuthContext.signOut: Starting sign out process');
    setLoading(true);
    
    try {
      // Clear authentication state
      console.log('🔑 AuthContext.signOut: Clearing user and profile state');
      setUser(null);
      setProfile(null);
      
      // Clear all localStorage data related to the CMS
      console.log('🔑 AuthContext.signOut: Clearing localStorage data');
      const keysToRemove = [
        'cms-general-settings',
        'cms-appearance-settings', 
        'cms-content-settings',
        'cms-seo-settings',
        'cms-settings-timestamp',
        'cms-test-settings'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🔑 AuthContext.signOut: Removed ${key} from localStorage`);
        } catch (error) {
          console.warn(`🔑 AuthContext.signOut: Failed to remove ${key} from localStorage:`, error);
        }
      });
      
      // Clear any sessionStorage data
      try {
        sessionStorage.clear();
        console.log('🔑 AuthContext.signOut: Cleared sessionStorage');
      } catch (error) {
        console.warn('🔑 AuthContext.signOut: Failed to clear sessionStorage:', error);
      }
      
      // Handle development bypass
      if (isDevelopmentMode()) {
        console.log('🔑 AuthContext.signOut: Development bypass enabled, skipping Supabase sign out');
      } else {
        // Sign out from Supabase
        console.log('🔑 AuthContext.signOut: Signing out from Supabase');
        await authService.signOut();
      }
      
      // Navigate to login page to ensure complete state reset
      console.log('🔑 AuthContext.signOut: Navigating to login page to ensure complete state reset');
      window.location.href = '/login'; // Navigate to login page instead of home
      
    } catch (error) {
      console.error('🔑 AuthContext.signOut: Error during sign out:', error);
      
      // Even if there's an error, clear local state and navigate to login
      setUser(null);
      setProfile(null);
      window.location.href = '/login';
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