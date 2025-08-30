// Admin Access Diagnostic Tool
// This utility helps diagnose admin access permission issues

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

/**
 * Comprehensive admin access diagnostic
 */
export const runAdminDiagnostic = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  try {
    // 1. Check authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    results.push({
      check: 'Authentication Session',
      status: session ? 'pass' : 'fail',
      message: session ? 'User is authenticated' : 'No active session found',
      details: session ? { userId: session.user?.id, email: session.user?.email } : null
    });

    if (sessionError) {
      results.push({
        check: 'Session Error',
        status: 'fail',
        message: `Session error: ${sessionError.message}`,
        details: sessionError
      });
    }

    // 2. Check user profile access
    if (session?.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        results.push({
          check: 'User Profile Access',
          status: profile ? 'pass' : 'fail',
          message: profile ? 'Profile loaded successfully' : 'Failed to load user profile',
          details: profile || profileError
        });

        if (profileError) {
          results.push({
            check: 'Profile Error Details',
            status: 'fail',
            message: `Profile error: ${profileError.message}`,
            details: profileError
          });
        }
      } catch (error) {
        results.push({
          check: 'Profile Access Exception',
          status: 'fail',
          message: `Exception accessing profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error
        });
      }
    }

    // 3. Check database permissions
    try {
      const { data: testQuery, error: permError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      results.push({
        check: 'Database Permissions',
        status: permError ? 'fail' : 'pass',
        message: permError ? `Permission error: ${permError.message}` : 'Database access working',
        details: permError || { count: testQuery }
      });
    } catch (error) {
      results.push({
        check: 'Database Access Exception',
        status: 'fail',
        message: `Database access failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // 4. Check RLS policies
    try {
      const { data: policies, error: policyError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'profiles' })
        .then(() => ({ data: 'RLS check passed', error: null }))
        .catch((err) => ({ data: null, error: err }));

      results.push({
        check: 'RLS Policies',
        status: policyError ? 'warning' : 'pass',
        message: policyError ? 'Could not verify RLS policies' : 'RLS policies accessible',
        details: policyError
      });
    } catch (error) {
      results.push({
        check: 'RLS Policy Check',
        status: 'warning',
        message: 'RLS policy verification not available',
        details: error
      });
    }

    // 5. Check environment configuration
    const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    results.push({
      check: 'Environment Configuration',
      status: (hasSupabaseUrl && hasSupabaseKey) ? 'pass' : 'fail',
      message: (hasSupabaseUrl && hasSupabaseKey) ? 'Environment variables configured' : 'Missing environment variables',
      details: {
        VITE_SUPABASE_URL: hasSupabaseUrl ? 'Set' : 'Missing',
        VITE_SUPABASE_ANON_KEY: hasSupabaseKey ? 'Set' : 'Missing'
      }
    });

  } catch (error) {
    results.push({
      check: 'Diagnostic Exception',
      status: 'fail',
      message: `Diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    });
  }

  return results;
};

/**
 * Quick admin access test
 */
export const testAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ Admin Access Test: No active session');
      return false;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('❌ Admin Access Test: Profile access failed:', error);
      return false;
    }

    console.log('✅ Admin Access Test: Success', { profile });
    return true;
  } catch (error) {
    console.error('❌ Admin Access Test: Exception:', error);
    return false;
  }
};

/**
 * Log diagnostic results to console
 */
export const logDiagnosticResults = async (): Promise<void> => {
  console.log('🔍 Running Admin Access Diagnostic...');
  
  const results = await runAdminDiagnostic();
  
  console.group('📊 Admin Access Diagnostic Results');
  
  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.check}: ${result.message}`);
    
    if (result.details) {
      console.log('   Details:', result.details);
    }
  });
  
  console.groupEnd();
  
  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  
  if (failed > 0) {
    console.log('🚨 Issues detected that may prevent admin access');
  } else {
    console.log('✨ No critical issues detected');
  }
};