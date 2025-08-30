import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getConnectionStatus, testSupabaseConnection, retryOperation } from '../lib/supabase';
import { AuthService } from '../services/authService';
import type { Profile } from '../types/auth';
import { withTimeout, ConnectionError, TimeoutError, AuthenticationError } from '../utils/timeout';
import { isDevelopmentMode, mockData } from '../utils/developmentMode';

// Session storage keys
const SESSION_STORAGE_KEYS = {
  USER: 'cms-user-session',
  PROFILE: 'cms-profile-session',
  EMAIL: 'cms-user-email'
};

// Session storage utilities
const sessionStorage = {
  setUser: (user: any) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEYS.USER, JSON.stringify(user));
      if (user?.email) {
        localStorage.setItem(SESSION_STORAGE_KEYS.EMAIL, user.email);
      }
    } catch (error) {
      console.warn('Failed to store user session:', error);
    }
  },
  setProfile: (profile: Profile) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to store profile session:', error);
    }
  },
  getUser: () => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve user session:', error);
      return null;
    }
  },
  getProfile: () => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEYS.PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve profile session:', error);
      return null;
    }
  },
  getEmail: () => {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEYS.EMAIL);
    } catch (error) {
      console.warn('Failed to retrieve email session:', error);
      return null;
    }
  },
  clear: () => {
    try {
      Object.values(SESSION_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }
};

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // isAdmin property removed - all authenticated users have access
  connectionStatus: { auth: boolean; database: boolean; lastChecked: number };
  testConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from stored session data or development mode
  const getInitialUser = () => {
    if (isDevelopmentMode()) {
      const storedEmail = sessionStorage.getEmail();
      if (storedEmail) {
        // Use stored email for development mode
        const { createMockData } = require('../utils/developmentMode');
        return createMockData(storedEmail).user;
      }
      return mockData.user;
    }
    return sessionStorage.getUser();
  };

  const getInitialProfile = () => {
    if (isDevelopmentMode()) {
      const storedEmail = sessionStorage.getEmail();
      if (storedEmail) {
        // Use stored email for development mode
        const { createMockData } = require('../utils/developmentMode');
        return createMockData(storedEmail).profile;
      }
      return mockData.profile;
    }
    return sessionStorage.getProfile();
  };

  const [user, setUser] = useState<any | null>(getInitialUser());
  const [profile, setProfile] = useState<Profile | null>(getInitialProfile());
  const [loading, setLoading] = useState(isDevelopmentMode() ? false : true);
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());

  // User role check removed - allow all authenticated users

  // Enhanced setUser function that persists to storage
  const setUserWithPersistence = (newUser: any | null) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setUser(newUser);
    } else {
      sessionStorage.clear();
    }
  };

  // Enhanced setProfile function that persists to storage
  const setProfileWithPersistence = (newProfile: Profile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      sessionStorage.setProfile(newProfile);
    }
  };

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
        
        // First, check if we have valid session data in localStorage
        const storedUser = sessionStorage.getUser();
        const storedProfile = sessionStorage.getProfile();
        
        if (storedUser && storedProfile) {
          console.log('🔄 AuthContext: Found stored session data, restoring from localStorage');
          setUser(storedUser);
          setProfile(storedProfile);
          setLoading(false);
          return;
        }
        
        console.log('🔄 AuthContext: No stored session found, checking Supabase session');
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await withTimeout(
          sessionPromise,
          20000, // 20 second timeout for initial session
          'Failed to initialize authentication session - connection timeout'
        );
        
        console.log('🔄 AuthContext: Initial session loaded', { hasSession: !!session, hasUser: !!session?.user });
        
        setUserWithPersistence(session?.user ?? null);
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
        setUserWithPersistence(null);
        setProfileWithPersistence(null);
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
        
        setUserWithPersistence(session?.user ?? null);
        if (session?.user) {
          console.log('🔄 AuthContext.onAuthStateChange: Loading user profile');
          await loadUserProfile(session.user.id);
        } else {
          console.log('🔄 AuthContext.onAuthStateChange: No session, clearing profile');
          setProfileWithPersistence(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, retries: number = 2) => {
    console.log('👤 AuthContext.loadUserProfile: Loading profile for user', { userId, retriesLeft: retries });
    
    // In development mode, try to fetch real profile data first, then fall back to mock data
    if (isDevelopmentMode()) {
      console.log('👤 AuthContext.loadUserProfile: Development bypass enabled, attempting to fetch real profile data first');
      
      try {
        // Try to fetch real profile data from database
        console.log('👤 AuthContext.loadUserProfile: Attempting to fetch real profile from database');
        const userProfile = await authService.getUserProfile(userId);
        
        console.log('👤 AuthContext.loadUserProfile: Real profile loaded successfully', { 
          profileId: userProfile.id, 
          email: userProfile.email, 
          fullName: userProfile.full_name,
          role: userProfile.role 
        });
        
        setProfileWithPersistence(userProfile);
        setLoading(false);
        return;
      } catch (error) {
        console.warn('👤 AuthContext.loadUserProfile: Failed to fetch real profile, falling back to mock data', error);
        
        // Fall back to mock data if real profile fetch fails
        const currentEmail = user?.email || 'user@example.com';
        const { createMockData } = await import('../utils/developmentMode');
        const mockData = createMockData(currentEmail);
        
        setProfileWithPersistence(mockData.profile as any);
        setLoading(false);
        return;
      }
    }
    
    try {
      console.log('👤 AuthContext.loadUserProfile: Calling authService.getUserProfile');
      const userProfile = await authService.getUserProfile(userId);
      
      console.log('👤 AuthContext.loadUserProfile: Profile loaded successfully', { 
        profileId: userProfile.id, 
        email: userProfile.email, 
        role: userProfile.role 
      });
      
      setProfileWithPersistence(userProfile);
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
        setProfileWithPersistence(null);
      } else {
        console.error('👤 AuthContext.loadUserProfile: Profile error, clearing session');
        // For other errors, clear both profile and user
        setProfileWithPersistence(null);
        setUserWithPersistence(null);
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
      console.log('🔑 AuthContext.signIn: Development bypass enabled, attempting to fetch real profile for email:', email);
      
      try {
        // Try to fetch real user profile by email from database
        console.log('🔑 AuthContext.signIn: Attempting to fetch real profile from database by email');
        const response = await authService.signIn(email, password);
        
        if (response.user && !response.error) {
          console.log('🔑 AuthContext.signIn: Real authentication successful, loading profile');
          const userProfile = await authService.getUserProfile(response.user.id);
          
          console.log('🔑 AuthContext.signIn: Real profile loaded', { 
            fullName: userProfile.full_name,
            email: userProfile.email,
            role: userProfile.role 
          });
          
          setUser(response.user as any);
          setProfile(userProfile);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('🔑 AuthContext.signIn: Real authentication failed, falling back to mock data', error);
      }
      
      // Fall back to mock data if real authentication fails
      console.log('🔑 AuthContext.signIn: Using mock data for development bypass');
      const { createMockData } = await import('../utils/developmentMode');
      const mockData = createMockData(email);
      
      // Set the user and profile with the entered email
      setUserWithPersistence(mockData.user as any);
      setProfileWithPersistence(mockData.profile as any);
      sessionStorage.setEmail(email); // Store email for session persistence
      setLoading(false);
      return;
    }
    
    try {
      // Validate input parameters
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
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
      
      if (!response.user) {
        console.error('🔑 AuthContext.signIn: No user data received');
        setLoading(false);
        throw new Error('Authentication failed - no user data received');
      }
      
      // Check if user has valid role after successful authentication
      if (response.user) {
        console.log('🔑 AuthContext.signIn: Checking user role');
        try {
          // Add retry logic for profile loading
          const userProfile = await retryOperation(
            () => authService.getUserProfile(response.user.id),
            3, // 3 retries
            1000 // 1 second delay
          );
          console.log('🔑 AuthContext.signIn: User profile loaded', { role: userProfile.role });
          
          // Allow any authenticated user to access the system
          console.log('🔑 AuthContext.signIn: User authenticated successfully', { 
            email, 
            role: userProfile.role 
          });
        } catch (profileError) {
          console.error('🔑 AuthContext.signIn: Error loading user profile for role check', profileError);
          
          // In development mode, be more lenient with profile errors
          if (isDevelopmentMode()) {
            console.warn('🔑 AuthContext.signIn: Development mode - profile error, but continuing with mock data');
            // Use mock data if profile loading fails in development
            const { createMockData } = await import('../utils/developmentMode');
            const mockData = createMockData(email);
            setUserWithPersistence(response.user as any);
            setProfileWithPersistence(mockData.profile as any);
            sessionStorage.setEmail(email); // Store email for session persistence
            setLoading(false);
            return;
          }
          
          // If we can't load the profile in production, provide more specific error
          try {
            await authService.signOut();
          } catch (signOutError) {
            console.warn('🔑 AuthContext.signIn: Failed to sign out after profile error:', signOutError);
          }
          setLoading(false);
          
          if (profileError instanceof ConnectionError || profileError instanceof TimeoutError) {
            console.error('🔑 AuthContext.signIn: Connection/Timeout error details:', profileError);
            throw new Error('Unable to connect to user profile service. Please check your internet connection and try again.');
          } else {
            console.error('🔑 AuthContext.signIn: Profile permission error details:', {
              error: profileError,
              message: profileError instanceof Error ? profileError.message : 'Unknown error',
              userId: response.user?.id,
              email: email
            });
            throw new Error(`Unable to verify user permissions: ${profileError instanceof Error ? profileError.message : 'Unknown error'}. Please check the Admin Access Verifier for detailed diagnostics.`);
          }
        }
      }
      
      console.log('🔑 AuthContext.signIn: User verified, proceeding with login');
      
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
    
    try {
      // Clear authentication state immediately for better UX
      console.log('🔑 AuthContext.signOut: Clearing user and profile state');
      setUserWithPersistence(null);
      setProfileWithPersistence(null);
      
      // Clear all localStorage and sessionStorage data
      console.log('🔑 AuthContext.signOut: Clearing localStorage data');
      const keysToRemove = [
        'cms-general-settings',
        'cms-appearance-settings', 
        'cms-content-settings',
        'cms-seo-settings',
        'cms-settings-timestamp',
        'cms-test-settings',
        'supabase.auth.token',
        'sb-' // Clear any Supabase auth tokens
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🔑 AuthContext.signOut: Removed ${key} from localStorage`);
        } catch (error) {
          console.warn(`🔑 AuthContext.signOut: Failed to remove ${key} from localStorage:`, error);
        }
      });
      
      // Clear all localStorage keys that start with 'sb-' (Supabase auth keys)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          try {
            localStorage.removeItem(key);
            console.log(`🔑 AuthContext.signOut: Removed Supabase key ${key}`);
          } catch (error) {
            console.warn(`🔑 AuthContext.signOut: Failed to remove ${key}:`, error);
          }
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
        try {
          await withTimeout(
            authService.signOut(),
            5000, // 5 second timeout
            'Sign out request timed out'
          );
          console.log('🔑 AuthContext.signOut: Supabase sign out completed');
        } catch (error) {
          console.error('🔑 AuthContext.signOut: Supabase sign out failed:', error);
          // Continue with local cleanup even if Supabase sign out fails
        }
      }
      
      // Force page reload to ensure complete state reset
      console.log('🔑 AuthContext.signOut: Navigating to login page to ensure complete state reset');
      window.location.replace('/login'); // Use replace to prevent back button issues
      
    } catch (error) {
      console.error('🔑 AuthContext.signOut: Error during sign out:', error);
      
      // Even if there's an error, clear local state and navigate to login
      setUserWithPersistence(null);
        setProfileWithPersistence(null);
      
      // Force reload to ensure clean state
      window.location.replace('/login');
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