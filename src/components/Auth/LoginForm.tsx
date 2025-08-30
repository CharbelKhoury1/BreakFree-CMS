import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, LogIn, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { debugAuthentication, logAuthDebugInfo } from '../../utils/authDebug';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Connection check failed:', error);
          setConnectionStatus('error');
        } else {
          console.log('Connection check successful');
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Connection check exception:', error);
        setConnectionStatus('error');
      }
    };
    
    checkConnection();
  }, []);

  // Clear form fields when user signs out
  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    try {
      console.log('🔑 LoginForm: Attempting sign in with email:', email);
      await signIn(email, password);
      // Don't show success toast immediately - let AuthContext handle the full authentication flow
      // The success will be evident when user is redirected to dashboard
      console.log('🔑 LoginForm: Sign in completed, navigating to dashboard');
      navigate('/'); // Redirect to dashboard after successful login
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('🔑 LoginForm: Sign in failed:', errorMessage);
      setError(errorMessage);
      
      // Show toast notification for better user feedback
      if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
        toast.error('Connection issue detected. Please check your internet connection and try again.', {
          duration: 5000,
        });
      } else if (errorMessage.includes('credentials') || errorMessage.includes('password')) {
        toast.error('Invalid login credentials. Please check your email and password.', {
          duration: 5000,
        });
      } else if (errorMessage.includes('access')) {
        toast.error('Access denied. Please check your credentials.', {
          duration: 5000,
        });
      } else {
        toast.error(`Login failed: ${errorMessage}`, {
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  


  const handleFallbackAccess = () => {
    toast.success('Accessing dashboard in development mode');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white shadow rounded-lg">
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-bold">BreakFree CMS</h1>
          <p className="text-sm text-gray-600">Sign in to access the dashboard</p>
          
          {/* Connection Status Indicator */}
          <div className="mt-2">
            {connectionStatus === 'checking' && (
              <div className="flex items-center justify-center space-x-2 text-yellow-600">
                <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Checking connection...</span>
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs">Connected to Supabase</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <XCircle className="w-3 h-3" />
                <span className="text-xs">Connection error - check environment variables</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {/* Environment Check Warning */}
            {connectionStatus === 'error' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Configuration Issue</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Unable to connect to Supabase. Please check your environment variables:
                </p>
                <ul className="text-xs text-yellow-600 mt-2 space-y-1">
                  <li>• VITE_SUPABASE_URL</li>
                  <li>• VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              disabled={isLoading || connectionStatus === 'error'}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
            

            {error && error.includes('connection') && (
              <div className="text-center">
                <p className="text-xs text-gray-500 mt-2">
                  Having connection issues? Check your internet connection and try again.
                </p>
              </div>
            )}
            
            {error && error.includes('permissions') && (
              <div className="text-center">
                <p className="text-xs text-gray-500 mt-2">
                  Having permission issues? Try the{' '}
                  <button
                    onClick={() => navigate('/admin/access-verifier')}
                    className="text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Admin Access Verifier
                  </button>
                  {' '}for detailed diagnostics.
                </p>
              </div>
            )}
            
            {/* Development Fallback Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">

              <button
                type="button"
                onClick={handleFallbackAccess}
                className="w-full inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
              >
                <Shield className="w-4 h-4 mr-2" />
                Access Dashboard (Development Mode)
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Use this button if login is not working or for development purposes
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}