import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  Shield,
  Users,
  Activity,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Monitor,
  Lock,
  Database,
  LogOut,
  Edit3,
  Eye,
  Trash2,
  Power
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminPanelProps {
  className?: string;
}

export function AdminPanel({ className = '' }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { actualTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSection(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveSection(null);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const adminSections = [
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Edit admin details and preferences',
      icon: User,
      items: [
        { label: 'Edit Profile', icon: Edit3, action: () => console.log('Edit Profile') },
        { label: 'Change Avatar', icon: User, action: () => console.log('Change Avatar') },
        { label: 'Preferences', icon: Settings, action: () => console.log('Preferences') }
      ]
    },
    {
      id: 'monitoring',
      title: 'System Monitoring',
      description: 'View system stats and performance',
      icon: Monitor,
      items: [
        { label: 'System Stats', icon: Activity, action: () => console.log('System Stats') },
        { label: 'Performance', icon: Monitor, action: () => console.log('Performance') },
        { label: 'Error Logs', icon: Eye, action: () => console.log('Error Logs') }
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      items: [
        { label: 'All Users', icon: Users, action: () => console.log('All Users') },
        { label: 'Permissions', icon: Shield, action: () => console.log('Permissions') },
        { label: 'Roles', icon: Settings, action: () => console.log('Roles') }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Password and security options',
      icon: Shield,
      items: [
        { label: 'Change Password', icon: Lock, action: () => console.log('Change Password') },
        { label: 'Two-Factor Auth', icon: Shield, action: () => console.log('Two-Factor Auth') },
        { label: 'Session Management', icon: Activity, action: () => console.log('Session Management') }
      ]
    },
    {
      id: 'backup',
      title: 'Backup & Export',
      description: 'Database and content management',
      icon: Download,
      items: [
        { label: 'Database Backup', icon: Database, action: () => console.log('Database Backup') },
        { label: 'Export Content', icon: Download, action: () => console.log('Export Content') },
        { label: 'Import Data', icon: RefreshCw, action: () => console.log('Import Data') }
      ]
    },
    {
      id: 'logs',
      title: 'Activity Logs',
      description: 'Recent actions and history',
      icon: Activity,
      items: [
        { label: 'Admin Actions', icon: Activity, action: () => console.log('Admin Actions') },
        { label: 'Login History', icon: Eye, action: () => console.log('Login History') },
        { label: 'System Events', icon: Monitor, action: () => console.log('System Events') }
      ]
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      description: 'System maintenance tools',
      icon: RefreshCw,
      items: [
        { label: 'Clear Cache', icon: Trash2, action: () => console.log('Clear Cache') },
        { label: 'Maintenance Mode', icon: Power, action: () => console.log('Maintenance Mode') },
        { label: 'Restart Services', icon: RefreshCw, action: () => console.log('Restart Services') }
      ]
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Add logout logic here
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Admin User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full p-4 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Admin panel menu"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="ml-3 flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Dashboard Access
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Admin Control Panel
            </h3>
            
            {/* Admin Sections */}
            <div className="space-y-2">
              {adminSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <div key={section.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded-lg"
                      aria-expanded={isActive}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {section.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        {isActive ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {/* Section Items */}
                    {isActive && (
                      <div className="px-3 pb-3">
                        <div className="pl-8 space-y-1">
                          {section.items.map((item, index) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                              >
                                <ItemIcon className="h-4 w-4 mr-2" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Logout Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}