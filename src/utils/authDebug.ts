// Authentication debugging utilities
import { supabase } from '../lib/supabase';

export interface AuthDebugInfo {
  hasSupabaseConfig: boolean;
  supabaseUrl: string | null;
  hasAnonKey: boolean;
  sessionExists: boolean;
  userExists: boolean;
  profileExists: boolean;
  userRole: string | null;
  connectionTest: boolean;
  timestamp: string;
}

/**
 * Comprehensive authentication debugging function
 */
export async function debugAuthentication(): Promise<AuthDebugInfo> {
  const timestamp = new Date().toISOString();
  
  try {
    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);
    const hasAnonKey = !!supabaseAnonKey;
    
    // Test basic connection
    let connectionTest = false;
    let sessionExists = false;
    let userExists = false;
    let profileExists = false;
    let userRole: string | null = null;
    
    if (hasSupabaseConfig) {
      try {
        // Test session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        connectionTest = !sessionError;
        sessionExists = !!sessionData.session;
        userExists = !!sessionData.session?.user;
        
        // Test profile if user exists
        if (sessionData.session?.user) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', sessionData.session.user.id)
              .single();
            
            profileExists = !profileError && !!profileData;
            userRole = profileData?.role || null;
          } catch (profileError) {
            console.warn('Profile check failed:', profileError);
          }
        }
      } catch (error) {
        console.error('Connection test failed:', error);
      }
    }
    
    return {
      hasSupabaseConfig,
      supabaseUrl,
      hasAnonKey,
      sessionExists,
      userExists,
      profileExists,
      userRole,
      connectionTest,
      timestamp
    };
  } catch (error) {
    console.error('Debug authentication failed:', error);
    return {
      hasSupabaseConfig: false,
      supabaseUrl: null,
      hasAnonKey: false,
      sessionExists: false,
      userExists: false,
      profileExists: false,
      userRole: null,
      connectionTest: false,
      timestamp
    };
  }
}

/**
 * Log authentication debug information to console
 */
export async function logAuthDebugInfo(): Promise<void> {
  const debugInfo = await debugAuthentication();
  
  console.group('🔍 Authentication Debug Information');
  console.log('Timestamp:', debugInfo.timestamp);
  console.log('Supabase Config:', debugInfo.hasSupabaseConfig ? '✅ Valid' : '❌ Missing');
  console.log('Supabase URL:', debugInfo.supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('Anon Key:', debugInfo.hasAnonKey ? '✅ Set' : '❌ Missing');
  console.log('Connection Test:', debugInfo.connectionTest ? '✅ Success' : '❌ Failed');
  console.log('Session Exists:', debugInfo.sessionExists ? '✅ Yes' : '❌ No');
  console.log('User Exists:', debugInfo.userExists ? '✅ Yes' : '❌ No');
  console.log('Profile Exists:', debugInfo.profileExists ? '✅ Yes' : '❌ No');
  console.log('User Role:', debugInfo.userRole || 'Not found');
  console.groupEnd();
}

/**
 * Test user creation
 */
export async function testUserCreation(email: string = 'user@example.com'): Promise<boolean> {
  try {
    console.log('🧪 Testing user creation for:', email);
    
    // Check if user exists in auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Failed to list users:', listError);
      return false;
    }
    
    const userExists = users.users.some(user => user.email === email);
    console.log('User exists in auth:', userExists);
    
    if (userExists) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (profileError) {
        console.error('Profile check failed:', profileError);
        return false;
      }
      
      console.log('Profile found:', profile);
      return profile.role === 'user' || profile.role === 'admin'; // Accept any valid role
    }
    
    return false;
  } catch (error) {
    console.error('User test failed:', error);
    return false;
  }
}