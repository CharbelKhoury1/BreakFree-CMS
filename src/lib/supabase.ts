import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

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

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required. Please check your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('🔌 Supabase connection error:', error);
  } else {
    console.log('🔌 Supabase connected successfully', { hasSession: !!data.session });
  }
});

// Test database connectivity
supabase.from('profiles').select('count', { count: 'exact', head: true }).then(({ count, error }) => {
  if (error) {
    console.error('🔌 Supabase database connection error:', error);
  } else {
    console.log('🔌 Supabase database connected successfully', { profileCount: count });
  }
});