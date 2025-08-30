import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component that checks authentication status and redirects accordingly:
 * - If user is authenticated, renders children (main content)
 * - If user is not authenticated, redirects to login page
 * - Shows loading state while authentication is being checked
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, profile } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main content
  if (user || profile) {
    return <>{children}</>;
  }

  // If no user is authenticated, redirect to login
  return <Navigate to="/login" replace />;
}