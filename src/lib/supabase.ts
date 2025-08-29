import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { ConnectionError } from '../utils/timeout';

// Get environment variables with debugging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Environment variables check:', {
  VITE_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing',
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0
});

// Enhanced validation for environment variables
if (!supabaseUrl) {
  const error = new Error('VITE_SUPABASE_URL is required. Please check your .env file and ensure it contains a valid Supabase URL.');
  console.error('❌ Supabase Configuration Error:', error.message);
  throw error;
}

if (!supabaseAnonKey) {
  const error = new Error('VITE_SUPABASE_ANON_KEY is required. Please check your .env file and ensure it contains a valid Supabase anonymous key.');
  console.error('❌ Supabase Configuration Error:', error.message);
  throw error;
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  const error = new Error('VITE_SUPABASE_URL appears to be invalid. It should be a valid Supabase URL (https://your-project.supabase.co).');
  console.error('❌ Supabase Configuration Error:', error.message);
  throw error;
}

// Validate key format (basic check)
if (supabaseAnonKey.length < 100) {
  const error = new Error('VITE_SUPABASE_ANON_KEY appears to be invalid. It should be a long JWT token.');
  console.error('❌ Supabase Configuration Error:', error.message);
  throw error;
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Connection status tracking
let connectionStatus = {
  auth: false,
  database: false,
  lastChecked: Date.now()
};

// Test the connection with timeout
const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test auth connection
    const authPromise = supabase.auth.getSession();
    const authTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new ConnectionError('Auth connection timeout')), 5000)
    );
    
    const { data, error } = await Promise.race([authPromise, authTimeout]) as any;
    
    if (error) {
      console.error('🔌 Supabase auth connection error:', error);
      connectionStatus.auth = false;
    } else {
      console.log('🔌 Supabase auth connected successfully', { hasSession: !!data.session });
      connectionStatus.auth = true;
    }
    
    // Test database connectivity
    const dbPromise = supabase.from('profiles').select('count', { count: 'exact', head: true });
    const dbTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new ConnectionError('Database connection timeout')), 5000)
    );
    
    const { count, error: dbError } = await Promise.race([dbPromise, dbTimeout]) as any;
    
    if (dbError) {
      console.error('🔌 Supabase database connection error:', dbError);
      connectionStatus.database = false;
      
      // Check for specific error types
      if (dbError.message?.includes('permission denied')) {
        console.error('❌ Database permission error. Please check your RLS policies and user permissions.');
      }
    } else {
      console.log('🔌 Supabase database connected successfully', { profileCount: count });
      connectionStatus.database = true;
    }
    
    connectionStatus.lastChecked = Date.now();
    
  } catch (error) {
    console.error('🔌 Supabase connection test failed:', error);
    connectionStatus.auth = false;
    connectionStatus.database = false;
    connectionStatus.lastChecked = Date.now();
  }
};

// Run initial connection test
testConnection();

// Export connection status checker
export const getConnectionStatus = () => ({ ...connectionStatus });

// Export connection test function
export const testSupabaseConnection = testConnection;