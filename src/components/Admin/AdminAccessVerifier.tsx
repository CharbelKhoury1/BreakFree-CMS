import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { runAdminDiagnostic, testAdminAccess, type DiagnosticResult } from '../../utils/adminDiagnostic';
import { toast } from 'sonner';

export function AdminAccessVerifier() {
  const { user, profile, loading } = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const results = await runAdminDiagnostic();
      setDiagnosticResults(results);
      setLastTestTime(new Date());
      
      const failedChecks = results.filter(r => r.status === 'fail');
      if (failedChecks.length > 0) {
        toast.error(`Diagnostic found ${failedChecks.length} issue(s)`);
      } else {
        toast.success('All diagnostic checks passed!');
      }
    } catch (error) {
      toast.error('Failed to run diagnostic');
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const testAccess = async () => {
    const success = await testAdminAccess();
    if (success) {
      toast.success('Admin access test passed!');
    } else {
      toast.error('Admin access test failed - check console for details');
    }
  };

  useEffect(() => {
    // Auto-run diagnostic on component mount
    runDiagnostic();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'fail':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const passedChecks = diagnosticResults.filter(r => r.status === 'pass').length;
  const failedChecks = diagnosticResults.filter(r => r.status === 'fail').length;
  const warningChecks = diagnosticResults.filter(r => r.status === 'warning').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Admin Access Verifier
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Diagnose and verify admin account permissions
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={testAccess}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Quick Test
              </button>
              <button
                onClick={runDiagnostic}
                disabled={isRunningDiagnostic}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isRunningDiagnostic ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Run Diagnostic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Current User Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Authentication</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {loading ? 'Loading...' : user ? 'Authenticated' : 'Not Authenticated'}
              </div>
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {user.email}
                </div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile ? 'Loaded' : 'Not Loaded'}
              </div>
              {profile && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {profile.full_name || 'No name set'}
                </div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile?.role || 'No role set'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                All authenticated users can access admin
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Results */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Diagnostic Results
            </h3>
            {lastTestTime && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last run: {lastTestTime.toLocaleTimeString()}
              </div>
            )}
          </div>

          {diagnosticResults.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{passedChecks}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failedChecks}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningChecks}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {diagnosticResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.check}</div>
                    <div className="text-sm mt-1">{result.message}</div>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer hover:underline">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {diagnosticResults.length === 0 && !isRunningDiagnostic && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No diagnostic results yet. Click "Run Diagnostic" to start.</p>
            </div>
          )}

          {isRunningDiagnostic && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-gray-600 dark:text-gray-400">Running diagnostic checks...</p>
            </div>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Troubleshooting Tips</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Ensure you're logged in with valid credentials</li>
            <li>• Check that your Supabase environment variables are configured</li>
            <li>• Verify your user profile exists in the database</li>
            <li>• All authenticated users should have admin access (no role restrictions)</li>
            <li>• Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}