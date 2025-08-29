import React, { useState } from 'react';
import {
  Key,
  Smartphone,
  Clock,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  MapPin,
  Trash2,
  Download,
  Copy,
  QrCode,
  RefreshCw,
  Bell,
  Settings,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActivity: string;
  current: boolean;
  trusted: boolean;
}

interface SecurityAuditLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
  status: 'success' | 'warning' | 'error';
}

export function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<'password' | '2fa' | 'sessions' | 'audit'>('password');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [backupCodes] = useState([
    'ABC123DEF456',
    'GHI789JKL012',
    'MNO345PQR678',
    'STU901VWX234',
    'YZA567BCD890'
  ]);
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      location: 'New York, US',
      ip: '192.168.1.100',
      lastActivity: '2 minutes ago',
      current: true,
      trusted: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'New York, US',
      ip: '192.168.1.101',
      lastActivity: '1 hour ago',
      current: false,
      trusted: true
    },
    {
      id: '3',
      device: 'MacBook Pro',
      browser: 'Firefox 121.0',
      location: 'Los Angeles, US',
      ip: '10.0.0.50',
      lastActivity: '3 days ago',
      current: false,
      trusted: false
    }
  ]);
  const [auditLogs] = useState<SecurityAuditLog[]>([
    {
      id: '1',
      action: 'Password changed',
      timestamp: '2024-01-15 14:30:00',
      ip: '192.168.1.100',
      device: 'Windows PC',
      status: 'success'
    },
    {
      id: '2',
      action: 'Failed login attempt',
      timestamp: '2024-01-15 10:15:00',
      ip: '203.0.113.1',
      device: 'Unknown',
      status: 'warning'
    },
    {
      id: '3',
      action: '2FA enabled',
      timestamp: '2024-01-14 16:45:00',
      ip: '192.168.1.100',
      device: 'Windows PC',
      status: 'success'
    },
    {
      id: '4',
      action: 'Suspicious login blocked',
      timestamp: '2024-01-14 09:20:00',
      ip: '198.51.100.1',
      device: 'Unknown',
      status: 'error'
    }
  ]);
  const [loginAlerts, setLoginAlerts] = useState({
    newDevice: true,
    suspiciousActivity: true,
    failedAttempts: true,
    passwordChanges: true
  });

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'text-yellow-500' };
    return { score, label: 'Strong', color: 'text-green-500' };
  };

  const validatePasswordForm = (): string[] => {
    const errors: string[] = [];
    if (!passwordForm.currentPassword) errors.push('Current password is required');
    if (!passwordForm.newPassword) errors.push('New password is required');
    if (passwordForm.newPassword.length < 8) errors.push('New password must be at least 8 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.push('Passwords do not match');
    if (passwordForm.currentPassword === passwordForm.newPassword) errors.push('New password must be different from current password');
    return errors;
  };

  const handlePasswordChange = async () => {
    const errors = validatePasswordForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = () => {
    setShowQRCode(true);
  };

  const handleConfirm2FA = () => {
    setTwoFactorEnabled(true);
    setShowQRCode(false);
    toast.success('Two-factor authentication enabled successfully');
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    toast.success('Two-factor authentication disabled');
  };

  const handleTerminateSession = (sessionId: string) => {
    toast.success('Session terminated successfully');
  };

  const handleCopyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Backup code copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'password', label: 'Change Password', icon: Key },
    { id: '2fa', label: 'Two-Factor Auth', icon: Smartphone },
    { id: 'sessions', label: 'Active Sessions', icon: Clock },
    { id: 'audit', label: 'Security Audit', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password to keep your account secure</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white pr-10"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white pr-10"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Password strength:</span>
                      <span className={`text-sm font-medium ${getPasswordStrength(passwordForm.newPassword).color}`}>
                        {getPasswordStrength(passwordForm.newPassword).label}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getPasswordStrength(passwordForm.newPassword).score <= 2
                            ? 'bg-red-500'
                            : getPasswordStrength(passwordForm.newPassword).score <= 4
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(getPasswordStrength(passwordForm.newPassword).score / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white pr-10"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Password Requirements:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li className="flex items-center space-x-2">
                    {passwordForm.newPassword.length >= 8 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    {/[A-Z]/.test(passwordForm.newPassword) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>One uppercase letter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    {/[a-z]/.test(passwordForm.newPassword) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>One lowercase letter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    {/[0-9]/.test(passwordForm.newPassword) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>One number</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span>One special character</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || validatePasswordForm().length > 0}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                {isChangingPassword ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Tab */}
      {activeTab === '2fa' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {!twoFactorEnabled ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Protect your account with an additional security layer using your mobile device
                  </p>
                </div>
                <button
                  onClick={handleEnable2FA}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication Enabled</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your account is protected with 2FA</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Backup Codes</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded px-3 py-2 border border-gray-200 dark:border-gray-600">
                        <code className="text-sm font-mono text-gray-900 dark:text-white">{code}</code>
                        <button
                          onClick={() => handleCopyBackupCode(code)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    <Download className="h-4 w-4 mr-1" />
                    Download Backup Codes
                  </button>
                </div>

                <button
                  onClick={handleDisable2FA}
                  className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disable 2FA
                </button>
              </div>
            )}
          </div>

          {/* QR Code Modal */}
          {showQRCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Set Up Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  
                  {/* QR Code Placeholder */}
                  <div className="mx-auto w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manual entry key:</p>
                    <code className="text-sm font-mono text-gray-900 dark:text-white">JBSWY3DPEHPK3PXP</code>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowQRCode(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm2FA}
                      className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    >
                      Confirm Setup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Sessions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your active login sessions across all devices</p>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{session.device}</h4>
                        {session.current && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Current
                          </span>
                        )}
                        {session.trusted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Trusted
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>{session.browser}</span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>IP: {session.ip}</span>
                          <span>Last active: {session.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Terminate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Login Alerts Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Login Alerts</h4>
            <div className="space-y-4">
              {Object.entries(loginAlerts).map(([key, enabled]) => {
                const labels = {
                  newDevice: 'New device login',
                  suspiciousActivity: 'Suspicious activity detected',
                  failedAttempts: 'Failed login attempts',
                  passwordChanges: 'Password changes'
                };
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{labels[key as keyof typeof labels]}</span>
                    </div>
                    <button
                      onClick={() => setLoginAlerts(prev => ({ ...prev, [key]: !enabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Security Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Audit Log</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review security-related activities on your account</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Security Events</h4>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                  Export Log
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-x-4">
                          <span>{log.timestamp}</span>
                          <span>IP: {log.ip}</span>
                          <span>Device: {log.device}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Recommendations</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Two-factor authentication enabled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your account has an extra layer of security</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Review active sessions</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">You have sessions from multiple locations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Strong password in use</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your password meets security requirements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}