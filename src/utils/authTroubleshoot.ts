// Authentication troubleshooting utilities
import { supabase } from '../lib/supabase';
import { debugAuthentication } from './authDebug';

export interface TroubleshootResult {
  issue: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  solution?: string;
}

/**
 * Comprehensive authentication troubleshooting
 */
export async function troubleshootAuth(): Promise<TroubleshootResult[]> {
  const results: TroubleshootResult[] = [];
  
  try {
    // 1. Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    results.push({
      issue: 'Environment Variables',
      status: (supabaseUrl && supabaseAnonKey) ? 'pass' : 'fail',
      message: (supabaseUrl && supabaseAnonKey) 
        ? 'Supabase environment variables are configured'
        : 'Missing Supabase environment variables',
      solution: !supabaseUrl || !supabaseAnonKey 
        ? 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file'
        : undefined
    });
    
    // 2. Test Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      results.push({
        issue: 'Supabase Connection',
        status: error ? 'fail' : 'pass',
        message: error ? `Connection failed: ${error.message}` : 'Successfully connected to Supabase',
        solution: error ? 'Check your internet connection and Supabase project status' : undefined
      });
    } catch (error) {
      results.push({
        issue: 'Supabase Connection',
        status: 'fail',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        solution: 'Verify your Supabase URL and check network connectivity'
      });
    }
    
    // 3. Check profiles table
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      results.push({
        issue: 'Profiles Table',
        status: error ? 'fail' : 'pass',
        message: error ? `Profiles table error: ${error.message}` : 'Profiles table accessible',
        solution: error ? 'Run database migrations to create the profiles table' : undefined
      });
    } catch (error) {
      results.push({
        issue: 'Profiles Table',
        status: 'fail',
        message: 'Cannot access profiles table',
        solution: 'Ensure database migrations have been run and RLS policies are configured'
      });
    }
    
    // 4. Check for admin users
    try {
      const { data: adminUsers, error } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('role', 'admin');
      
      if (error) {
        results.push({
          issue: 'Admin Users',
          status: 'fail',
          message: `Cannot check admin users: ${error.message}`,
          solution: 'Verify RLS policies allow reading profiles table'
        });
      } else {
        const adminCount = adminUsers?.length || 0;
        results.push({
          issue: 'Admin Users',
          status: adminCount > 0 ? 'pass' : 'warning',
          message: adminCount > 0 
            ? `Found ${adminCount} admin user(s): ${adminUsers.map(u => u.email).join(', ')}`
            : 'No admin users found',
          solution: adminCount === 0 
            ? 'Create an admin user in Supabase Auth dashboard and run the admin user migration'
            : undefined
        });
      }
    } catch (error) {
      results.push({
        issue: 'Admin Users',
        status: 'fail',
        message: 'Failed to check admin users',
        solution: 'Verify database connection and RLS policies'
      });
    }
    
    // 5. Test authentication flow
    const debugInfo = await debugAuthentication();
    results.push({
      issue: 'Current Session',
      status: debugInfo.sessionExists ? 'pass' : 'warning',
      message: debugInfo.sessionExists 
        ? `Active session found (Role: ${debugInfo.userRole || 'unknown'})`
        : 'No active session',
      solution: !debugInfo.sessionExists ? 'Sign in with valid admin credentials' : undefined
    });
    
  } catch (error) {
    results.push({
      issue: 'Troubleshooting',
      status: 'fail',
      message: `Troubleshooting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      solution: 'Check browser console for detailed error information'
    });
  }
  
  return results;
}

/**
 * Generate troubleshooting report
 */
export async function generateTroubleshootReport(): Promise<string> {
  const results = await troubleshootAuth();
  const debugInfo = await debugAuthentication();
  
  let report = '# Authentication Troubleshooting Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += '## Environment Check\n';
  report += `- Supabase URL: ${debugInfo.supabaseUrl ? '✅ Configured' : '❌ Missing'}\n`;
  report += `- Anon Key: ${debugInfo.hasAnonKey ? '✅ Configured' : '❌ Missing'}\n`;
  report += `- Connection: ${debugInfo.connectionTest ? '✅ Working' : '❌ Failed'}\n\n`;
  
  report += '## Authentication Status\n';
  report += `- Session: ${debugInfo.sessionExists ? '✅ Active' : '❌ None'}\n`;
  report += `- User: ${debugInfo.userExists ? '✅ Authenticated' : '❌ Not authenticated'}\n`;
  report += `- Profile: ${debugInfo.profileExists ? '✅ Found' : '❌ Missing'}\n`;
  report += `- Role: ${debugInfo.userRole || 'Not found'}\n\n`;
  
  report += '## Issue Analysis\n';
  results.forEach(result => {
    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    report += `${statusIcon} **${result.issue}**: ${result.message}\n`;
    if (result.solution) {
      report += `   *Solution*: ${result.solution}\n`;
    }
    report += '\n';
  });
  
  report += '## Next Steps\n';
  const failedChecks = results.filter(r => r.status === 'fail');
  const warningChecks = results.filter(r => r.status === 'warning');
  
  if (failedChecks.length > 0) {
    report += 'Critical issues found that need immediate attention:\n';
    failedChecks.forEach(check => {
      report += `- ${check.issue}: ${check.solution || 'See error message above'}\n`;
    });
  } else if (warningChecks.length > 0) {
    report += 'Warnings found that should be addressed:\n';
    warningChecks.forEach(check => {
      report += `- ${check.issue}: ${check.solution || 'See message above'}\n`;
    });
  } else {
    report += 'All checks passed! Authentication should be working correctly.\n';
  }
  
  return report;
}