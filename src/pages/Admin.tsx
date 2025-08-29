import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { UserProfile } from '../components/Admin/UserProfile';
import {
  User,
  Monitor,
  Users,
  Shield,
  Download,
  Activity,
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  route: string;
  stats?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  };
  status?: 'healthy' | 'warning' | 'error';
}

export function Admin() {
  const navigate = useNavigate();

  const handleSectionClick = (route: string) => {
    navigate(route);
  };

  const adminSections: AdminSection[] = [
    {
      id: 'profile',
      title: 'User Profile',
      icon: User,
      description: 'Manage your admin profile and preferences',
      route: '/admin/profile',
      stats: {
        label: 'Profile Completion',
        value: '85%',
        trend: 'up'
      },
      status: 'healthy'
    },
    {
      id: 'monitoring',
      title: 'System Monitoring',
      icon: Monitor,
      description: 'Monitor system performance and health',
      route: '/admin/monitoring',
      stats: {
        label: 'System Health',
        value: '99.9%',
        trend: 'stable'
      },
      status: 'healthy'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: Users,
      description: 'Manage users, roles, and permissions',
      route: '/admin/users',
      stats: {
        label: 'Active Users',
        value: '1,234',
        trend: 'up'
      },
      status: 'healthy'
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: Shield,
      description: 'Manage security and authentication',
      route: '/admin/security',
      stats: {
        label: 'Security Score',
        value: '95%',
        trend: 'up'
      },
      status: 'healthy'
    },
    {
      id: 'backup',
      title: 'Backup & Export',
      icon: Download,
      description: 'Backup data and export content',
      route: '/admin/backup',
      stats: {
        label: 'Last Backup',
        value: '2h ago',
        trend: 'stable'
      },
      status: 'healthy'
    },
    {
      id: 'logs',
      title: 'Activity Logs',
      icon: Activity,
      description: 'View system and user activity',
      route: '/admin/logs',
      stats: {
        label: 'Log Entries',
        value: '2,456',
        trend: 'up'
      },
      status: 'healthy'
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      icon: Zap,
      description: 'Perform common administrative tasks',
      route: '/admin/actions',
      stats: {
        label: 'Actions Today',
        value: '12',
        trend: 'down'
      },
      status: 'healthy'
    }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your system, users, and administrative settings</p>
        </div>

        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your admin profile and preferences</p>
              </div>
            </div>
          </div>
          <UserProfile />
        </div>

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.filter(section => section.id !== 'profile').map((section) => {
            const Icon = section.icon;
            
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.route)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:scale-105 text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{section.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className={`h-4 w-4 ${getStatusColor(section.status)}`} />
                        <span className={`text-xs font-medium ${getStatusColor(section.status)}`}>
                          {section.status === 'healthy' ? 'Healthy' : section.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{section.description}</p>
                
                {section.stats && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{section.stats.label}</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{section.stats.value}</p>
                    </div>
                    {getTrendIcon(section.stats.trend)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.9%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">567</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Blog Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">89</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}