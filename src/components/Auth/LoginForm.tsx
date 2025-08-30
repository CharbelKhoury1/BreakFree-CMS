import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, LogIn, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('ckhoury100@gmail.com');
  const [password, setPassword] = useState('EliteAtom22_');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

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

    try {
      await signIn(email, password);
      toast.success('Successfully signed in!');
      navigate('/'); // Redirect to dashboard after successful login
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
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
          <p className="text-sm text-gray-600">Sign in to access the admin dashboard</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              disabled={isLoading}
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