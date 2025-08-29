import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Save, 
  Info, 
  Globe, 
  Palette, 
  FileText, 
  Search,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

interface GeneralSettings {
  siteTitle: string;
  siteDescription: string;
  timezone: string;
  language: string;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
}

interface ContentSettings {
  defaultPostStatus: 'draft' | 'published';
  enableComments: boolean;
  moderateComments: boolean;
  postsPerPage: number;
}

interface SEOSettings {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  enableSitemap: boolean;
  enableRobotsTxt: boolean;
}

export function Settings() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteTitle: 'BreakFree CMS',
    siteDescription: 'A powerful content management system',
    timezone: 'UTC',
    language: 'en'
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: theme
  });

  // Sync theme context with local appearance settings
  useEffect(() => {
    setAppearanceSettings(prev => ({
      ...prev,
      theme: theme
    }));
  }, [theme]);
  
  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    defaultPostStatus: 'draft',
    enableComments: true,
    moderateComments: true,
    postsPerPage: 10
  });
  
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    defaultMetaTitle: 'BreakFree CMS',
    defaultMetaDescription: 'Manage your content with ease',
    enableSitemap: true,
    enableRobotsTxt: true
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedGeneral = localStorage.getItem('cms-general-settings');
      const savedAppearance = localStorage.getItem('cms-appearance-settings');
      const savedContent = localStorage.getItem('cms-content-settings');
      const savedSEO = localStorage.getItem('cms-seo-settings');
      const savedTimestamp = localStorage.getItem('cms-settings-timestamp');

      if (savedGeneral) {
        setGeneralSettings(JSON.parse(savedGeneral));
      }
      if (savedAppearance) {
        const parsed = JSON.parse(savedAppearance);
        // Only keep the theme property for backward compatibility
        setAppearanceSettings({ theme: parsed.theme || theme });
      }
      if (savedContent) {
        setContentSettings(JSON.parse(savedContent));
      }
      if (savedSEO) {
        setSeoSettings(JSON.parse(savedSEO));
      }
      if (savedTimestamp) {
        setLastSaved(new Date(savedTimestamp));
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      toast.error('Failed to load saved settings');
    }
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate settings before saving
      if (!generalSettings.siteTitle.trim()) {
        throw new Error('Site title is required');
      }
      
      if (contentSettings.postsPerPage < 1 || contentSettings.postsPerPage > 100) {
        throw new Error('Posts per page must be between 1 and 100');
      }
      
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const timestamp = new Date().toISOString();
      
      // Save to localStorage with error handling for each item
      const saveOperations = [
        () => localStorage.setItem('cms-general-settings', JSON.stringify(generalSettings)),
        () => localStorage.setItem('cms-appearance-settings', JSON.stringify(appearanceSettings)),
        () => localStorage.setItem('cms-content-settings', JSON.stringify(contentSettings)),
        () => localStorage.setItem('cms-seo-settings', JSON.stringify(seoSettings)),
        () => localStorage.setItem('cms-settings-timestamp', timestamp)
      ];
      
      saveOperations.forEach((operation, index) => {
        try {
          operation();
        } catch (error) {
          console.error(`Failed to save settings section ${index}:`, error);
          throw new Error(`Failed to save settings section ${index}`);
        }
      });
      
      setLastSaved(new Date(timestamp));
      toast.success('Settings saved successfully');
      
      // Log save event for debugging
      console.log('Settings saved at:', timestamp, {
        general: generalSettings,
        appearance: appearanceSettings,
        content: contentSettings,
        seo: seoSettings
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  


  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'system', label: 'System', icon: Info }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Title
        </label>
        <input
          type="text"
          id="siteTitle"
          value={generalSettings.siteTitle}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter site title"
        />
      </div>
      
      <div>
        <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          id="siteDescription"
          value={generalSettings.siteDescription}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter site description"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={generalSettings.timezone}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            id="language"
            value={generalSettings.language}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                console.log('Theme button clicked:', value, 'Current theme:', theme);
                setTheme(value as 'light' | 'dark' | 'system');
                setAppearanceSettings(prev => ({
                  ...prev,
                  theme: value as 'light' | 'dark' | 'system'
                }));
                console.log('Theme updated to:', value, 'Actual theme will be:', value === 'system' ? 'system-detected' : value);
              }}
              className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                theme === value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>


     </div>
   );

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="defaultPostStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Post Status
          </label>
          <select
            id="defaultPostStatus"
            value={contentSettings.defaultPostStatus}
            onChange={(e) => setContentSettings(prev => ({ ...prev, defaultPostStatus: e.target.value as 'draft' | 'published' }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="postsPerPage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Posts Per Page
          </label>
          <input
            type="number"
            id="postsPerPage"
            value={contentSettings.postsPerPage}
            onChange={(e) => setContentSettings(prev => ({ ...prev, postsPerPage: parseInt(e.target.value) }))}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Comments</label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Allow users to comment on posts</p>
          </div>
          <button
            onClick={() => setContentSettings(prev => ({ ...prev, enableComments: !prev.enableComments }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              contentSettings.enableComments ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                contentSettings.enableComments ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Moderate Comments</label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Require approval before comments are published</p>
          </div>
          <button
            onClick={() => setContentSettings(prev => ({ ...prev, moderateComments: !prev.moderateComments }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              contentSettings.moderateComments ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                contentSettings.moderateComments ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="defaultMetaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Meta Title
        </label>
        <input
          type="text"
          id="defaultMetaTitle"
          value={seoSettings.defaultMetaTitle}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, defaultMetaTitle: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter default meta title"
        />
      </div>
      
      <div>
        <label htmlFor="defaultMetaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Meta Description
        </label>
        <textarea
          id="defaultMetaDescription"
          value={seoSettings.defaultMetaDescription}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, defaultMetaDescription: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter default meta description"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Sitemap</label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Generate XML sitemap for search engines</p>
          </div>
          <button
            onClick={() => setSeoSettings(prev => ({ ...prev, enableSitemap: !prev.enableSitemap }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              seoSettings.enableSitemap ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                seoSettings.enableSitemap ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Robots.txt</label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Generate robots.txt file for search engines</p>
          </div>
          <button
            onClick={() => setSeoSettings(prev => ({ ...prev, enableRobotsTxt: !prev.enableRobotsTxt }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              seoSettings.enableRobotsTxt ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                seoSettings.enableRobotsTxt ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Production</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">January 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Cache</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
          </div>
        </div>
      </div>

    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'content':
        return renderContentSettings();
      case 'seo':
        return renderSEOSettings();
      case 'system':
        return renderSystemInfo();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your CMS configuration and preferences</p>
            {lastSaved && (
              <p className="text-sm text-green-600 mt-1">
                Last saved: {lastSaved.toLocaleString()}
              </p>
            )}
          </div>

        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label} Settings
              </h2>
              {activeTab !== 'system' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
            
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}