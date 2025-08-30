import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { BlogList } from './pages/BlogList';
import { BlogCreate } from './pages/BlogCreate';
import { BlogEdit } from './pages/BlogEdit';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { SystemMonitoringPage } from './pages/admin/SystemMonitoringPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { SecuritySettingsPage } from './pages/admin/SecuritySettingsPage';
import { BackupExportPage } from './pages/admin/BackupExportPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { QuickActionsPage } from './pages/admin/QuickActionsPage';

// Debug: Check environment variables
console.log('App.tsx - Environment variables check:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  NODE_ENV: import.meta.env.MODE,
  DEV: import.meta.env.DEV
});

function App() {
  // Check if Supabase is configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">image.png
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">BreakFree CMS</h1>
          <p className="text-gray-600 mb-4">
            Supabase configuration is missing. Please set up your environment variables:
          </p>
          <div className="bg-gray-100 p-4 rounded text-left text-sm font-mono">
            <p>VITE_SUPABASE_URL=your_supabase_url</p>
            <p>VITE_SUPABASE_ANON_KEY=your_supabase_anon_key</p>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            Create a .env file in the project root with these variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute>
                <BlogList />
              </ProtectedRoute>
            } />
            <Route path="/blogs/new" element={
              <ProtectedRoute>
                <BlogCreate />
              </ProtectedRoute>
            } />
            <Route path="/blogs/edit/:id" element={
              <ProtectedRoute>
                <BlogEdit />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/monitoring" element={
              <ProtectedRoute>
                <SystemMonitoringPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/security" element={
              <ProtectedRoute>
                <SecuritySettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/backup" element={
              <ProtectedRoute>
                <BackupExportPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute>
                <ActivityLogsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/actions" element={
              <ProtectedRoute>
                <QuickActionsPage />
              </ProtectedRoute>
            } />
            {/* Default route - redirect to login for unmatched paths */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </ThemeProvider>
   );
}

export default App;