import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  Monitor,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Shield,
  Globe,
  Smartphone,
  Calendar,
  TrendingUp,
  Activity,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'admin' | 'login' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  user?: string;
  userId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  device?: string;
  success?: boolean;
  metadata?: Record<string, any>;
}

interface LogStats {
  totalLogs: number;
  adminActions: number;
  loginAttempts: number;
  systemEvents: number;
  criticalEvents: number;
  failedLogins: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
}

const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'admin',
    severity: 'info',
    action: 'User Created',
    user: 'John Admin',
    userId: 'admin-001',
    details: 'Created new user account for jane.doe@example.com',
    ipAddress: '192.168.1.100',
    location: 'New York, US',
    device: 'Desktop'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'login',
    severity: 'info',
    action: 'Successful Login',
    user: 'Jane Doe',
    userId: 'user-123',
    details: 'User logged in successfully',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'London, UK',
    device: 'Desktop',
    success: true
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'system',
    severity: 'warning',
    action: 'High Memory Usage',
    details: 'System memory usage exceeded 85% threshold',
    metadata: { memoryUsage: '87%', threshold: '85%' }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    type: 'login',
    severity: 'error',
    action: 'Failed Login',
    user: 'Unknown',
    details: 'Failed login attempt with invalid credentials',
    ipAddress: '198.51.100.10',
    location: 'Unknown',
    device: 'Mobile',
    success: false
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    type: 'admin',
    severity: 'critical',
    action: 'Permission Changed',
    user: 'John Admin',
    userId: 'admin-001',
    details: 'Modified admin permissions for user role',
    ipAddress: '192.168.1.100',
    location: 'New York, US',
    device: 'Desktop'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'system',
    severity: 'info',
    action: 'Database Backup',
    details: 'Automated database backup completed successfully',
    metadata: { backupSize: '2.3GB', duration: '45s' }
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    type: 'admin',
    severity: 'info',
    action: 'Blog Post Published',
    user: 'Sarah Editor',
    userId: 'editor-002',
    details: 'Published blog post: "Getting Started with React"',
    ipAddress: '10.0.0.50',
    location: 'San Francisco, US',
    device: 'Desktop'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 40 * 60 * 1000),
    type: 'login',
    severity: 'warning',
    action: 'Multiple Login Attempts',
    user: 'Mike User',
    userId: 'user-456',
    details: 'Multiple failed login attempts detected',
    ipAddress: '172.16.0.25',
    location: 'Toronto, CA',
    device: 'Mobile',
    success: false
  }
];

const mockStats: LogStats = {
  totalLogs: 1247,
  adminActions: 342,
  loginAttempts: 567,
  systemEvents: 338,
  criticalEvents: 12,
  failedLogins: 89,
  uniqueUsers: 156,
  topActions: [
    { action: 'User Login', count: 234 },
    { action: 'Blog Post Created', count: 89 },
    { action: 'User Created', count: 67 },
    { action: 'Permission Changed', count: 45 },
    { action: 'System Backup', count: 23 }
  ]
};

export function ActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogEntries);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogEntries);
  const [stats, setStats] = useState<LogStats>(mockStats);
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'login' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new log entry
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: ['admin', 'login', 'system'][Math.floor(Math.random() * 3)] as any,
        severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as any,
        action: 'Real-time Event',
        details: 'Simulated real-time log entry',
        user: 'System',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255)
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep only latest 50
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs based on active filters
  useEffect(() => {
    let filtered = logs;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(log => log.type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // Filter by date range
    const now = new Date();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    if (dateRange !== 'all' && ranges[dateRange as keyof typeof ranges]) {
      const cutoff = new Date(now.getTime() - ranges[dateRange as keyof typeof ranges]);
      filtered = filtered.filter(log => log.timestamp >= cutoff);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, activeTab, searchTerm, severityFilter, dateRange]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'login':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'system':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Logs refreshed successfully');
    setIsLoading(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Logs exported successfully');
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Logs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor system activities and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              autoRefresh
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-1" />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 inline mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 inline mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Logs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.adminActions}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Admin Actions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.loginAttempts}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Login Attempts</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.systemEvents}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">System Events</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.criticalEvents}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Critical Events</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.failedLogins}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Failed Logins</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.uniqueUsers}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Users</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Filter className="h-4 w-4 inline mr-1" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />}
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSeverityFilter('all');
                    setDateRange('24h');
                    setActiveTab('all');
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Logs', count: filteredLogs.length },
            { id: 'admin', label: 'Admin Actions', count: logs.filter(l => l.type === 'admin').length },
            { id: 'login', label: 'Login History', count: logs.filter(l => l.type === 'login').length },
            { id: 'system', label: 'System Events', count: logs.filter(l => l.type === 'system').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {paginatedLogs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No logs found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(log.type)}
                      {getSeverityIcon(log.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</h4>
                        {log.success === false && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            Failed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{log.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {log.timestamp.toLocaleString()}
                        </span>
                        {log.user && (
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {log.user}
                          </span>
                        )}
                        {log.ipAddress && (
                          <span className="flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {log.ipAddress}
                          </span>
                        )}
                        {log.location && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {log.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(selectedLog.type)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{selectedLog.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(selectedLog.severity)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{selectedLog.severity}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.action}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.details}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timestamp</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.timestamp.toLocaleString()}</p>
                </div>
                
                {selectedLog.user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedLog.user}</p>
                  </div>
                )}
                
                {selectedLog.ipAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>
                  </div>
                )}
                
                {selectedLog.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedLog.location}</p>
                  </div>
                )}
                
                {selectedLog.device && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedLog.device}</p>
                  </div>
                )}
                
                {selectedLog.userAgent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Agent</label>
                    <p className="text-sm text-gray-900 dark:text-white break-all">{selectedLog.userAgent}</p>
                  </div>
                )}
                
                {selectedLog.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metadata</label>
                    <pre className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}