import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { ConnectionError } from '../utils/timeout';
import { isDevelopmentMode } from '../utils/developmentMode';

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

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeoutMs: 15000 // 15 seconds
};

// Exponential backoff retry function
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries,
  delay: number = RETRY_CONFIG.baseDelay
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.warn(`🔄 Operation failed, retrying in ${delay}ms... (${retries} retries left)`, error);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff with jitter
    const nextDelay = Math.min(delay * 2 + Math.random() * 1000, RETRY_CONFIG.maxDelay);
    return retryWithBackoff(operation, retries - 1, nextDelay);
  }
};

// Test the connection with timeout and retry logic
const testConnection = async () => {
  // Skip connection test in development mode
  if (isDevelopmentMode()) {
    console.log('🔌 Development mode: Skipping Supabase connection test');
    connectionStatus.auth = true;
    connectionStatus.database = true;
    connectionStatus.lastChecked = Date.now();
    return;
  }

  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test auth connection with retry
    await retryWithBackoff(async () => {
      const authPromise = supabase.auth.getSession();
      const authTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new ConnectionError('Auth connection timeout')), RETRY_CONFIG.timeoutMs)
      );
      
      const { data, error } = await Promise.race([authPromise, authTimeout]) as any;
      
      if (error) {
        console.error('🔌 Supabase auth connection error:', error);
        connectionStatus.auth = false;
        throw new ConnectionError(`Auth connection failed: ${error.message}`);
      } else {
        console.log('🔌 Supabase auth connected successfully', { hasSession: !!data.session });
        connectionStatus.auth = true;
      }
    });
    
    // Test database connectivity with retry
    await retryWithBackoff(async () => {
      const dbPromise = supabase.from('profiles').select('count', { count: 'exact', head: true });
      const dbTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new ConnectionError('Database connection timeout')), RETRY_CONFIG.timeoutMs)
      );
      
      const { count, error: dbError } = await Promise.race([dbPromise, dbTimeout]) as any;
      
      if (dbError) {
        console.error('🔌 Supabase database connection error:', dbError);
        connectionStatus.database = false;
        
        // Check for specific error types
        if (dbError.message?.includes('permission denied')) {
          console.error('❌ Database permission error. Please check your RLS policies and user permissions.');
          throw new Error(`Database permission error: ${dbError.message}`);
        }
        
        throw new ConnectionError(`Database connection failed: ${dbError.message}`);
      } else {
        console.log('🔌 Supabase database connected successfully', { profileCount: count });
        connectionStatus.database = true;
      }
    });
    
    connectionStatus.lastChecked = Date.now();
    console.log('✅ Supabase connection test completed successfully');
    
  } catch (error) {
    console.error('🔌 Supabase connection test failed after retries:', error);
    connectionStatus.auth = false;
    connectionStatus.database = false;
    connectionStatus.lastChecked = Date.now();
    
    // Don't throw the error to prevent app crashes
    // The connection status will reflect the failure
  }
};

// Run initial connection test
testConnection();

// Export connection status checker
export const getConnectionStatus = () => ({ ...connectionStatus });

// Export connection test function
export const testSupabaseConnection = testConnection;

// Export retry utility for use in other services
export const retryOperation = retryWithBackoff;

// Export retry configuration
export const SUPABASE_RETRY_CONFIG = RETRY_CONFIG;