import React, { useState, useEffect } from 'react';
import {
  Activity,
  Monitor,
  HardDrive,
  Wifi,
  Users,
  Database,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Power,
  Download,
  Cpu,
  MemoryStick,
  Server,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    status: 'online' | 'offline';
    latency: number;
    bandwidth: {
      upload: number;
      download: number;
    };
  };
  database: {
    status: 'connected' | 'disconnected';
    connections: number;
    queries: number;
  };
  activeUsers: number;
}

interface PerformanceMetrics {
  responseTime: number;
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
  };
  errorRate: number;
  uptime: {
    percentage: number;
    duration: string;
  };
  cacheHitRate: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
}

export function SystemMonitoring() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: { usage: 45, cores: 8, temperature: 62 },
    memory: { used: 8.2, total: 16, percentage: 51 },
    disk: { used: 256, total: 512, percentage: 50 },
    network: { status: 'online', latency: 12, bandwidth: { upload: 50, download: 100 } },
    database: { status: 'connected', connections: 25, queries: 1250 },
    activeUsers: 89
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    responseTime: 145,
    apiCalls: { total: 15420, successful: 15180, failed: 240 },
    errorRate: 1.6,
    uptime: { percentage: 99.9, duration: '15d 8h 32m' },
    cacheHitRate: 94.2
  });

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    {
      id: '1',
      timestamp: '2024-01-20 14:32:15',
      level: 'error',
      message: 'Database connection timeout',
      source: 'auth-service'
    },
    {
      id: '2',
      timestamp: '2024-01-20 14:28:42',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system-monitor'
    },
    {
      id: '3',
      timestamp: '2024-01-20 14:25:18',
      level: 'error',
      message: 'Failed to process payment request',
      source: 'payment-gateway'
    },
    {
      id: '4',
      timestamp: '2024-01-20 14:20:05',
      level: 'warning',
      message: 'Cache miss rate above threshold',
      source: 'cache-service'
    },
    {
      id: '5',
      timestamp: '2024-01-20 14:15:33',
      level: 'info',
      message: 'Scheduled backup completed successfully',
      source: 'backup-service'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(20, Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10))
        },
        memory: {
          ...prev.memory,
          percentage: Math.max(30, Math.min(85, prev.memory.percentage + (Math.random() - 0.5) * 5))
        },
        network: {
          ...prev.network,
          latency: Math.max(5, Math.min(50, prev.network.latency + (Math.random() - 0.5) * 5))
        },
        activeUsers: Math.max(50, Math.min(150, prev.activeUsers + Math.floor((Math.random() - 0.5) * 10)))
      }));

      setPerformanceMetrics(prev => ({
        ...prev,
        responseTime: Math.max(50, Math.min(300, prev.responseTime + (Math.random() - 0.5) * 20)),
        errorRate: Math.max(0.5, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5))
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshStats = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
    toast.success('System statistics refreshed');
  };

  const clearCache = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPerformanceMetrics(prev => ({ ...prev, cacheHitRate: 98.5 }));
    setIsLoading(false);
    toast.success('Cache cleared successfully');
  };

  const restartServices = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSystemStats(prev => ({
      ...prev,
      database: { ...prev.database, connections: 0 },
      network: { ...prev.network, status: 'online' as const }
    }));
    setTimeout(() => {
      setSystemStats(prev => ({
        ...prev,
        database: { ...prev.database, connections: 25 }
      }));
    }, 2000);
    setIsLoading(false);
    toast.success('Services restarted successfully');
  };

  const generateReport = () => {
    toast.info('Generating system report...');
    setTimeout(() => {
      toast.success('System report generated and downloaded');
    }, 2000);
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Monitoring</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshStats}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={clearCache}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </button>
          <button
            onClick={restartServices}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Power className="h-4 w-4 mr-2" />
            Restart Services
          </button>
          <button
            onClick={generateReport}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* System Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{systemStats.cpu.cores} cores</p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${getStatusColor(systemStats.cpu.usage, { warning: 70, critical: 85 })}`}>
              {systemStats.cpu.usage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                systemStats.cpu.usage >= 85 ? 'bg-red-500' :
                systemStats.cpu.usage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemStats.cpu.usage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Temperature: {systemStats.cpu.temperature}°C
          </p>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MemoryStick className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Memory</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {systemStats.memory.used.toFixed(1)} / {systemStats.memory.total} GB
                </p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${getStatusColor(systemStats.memory.percentage, { warning: 75, critical: 90 })}`}>
              {systemStats.memory.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                systemStats.memory.percentage >= 90 ? 'bg-red-500' :
                systemStats.memory.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemStats.memory.percentage}%` }}
            />
          </div>
        </div>

        {/* Disk Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Disk Space</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {systemStats.disk.used} / {systemStats.disk.total} GB
                </p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${getStatusColor(systemStats.disk.percentage, { warning: 80, critical: 95 })}`}>
              {systemStats.disk.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                systemStats.disk.percentage >= 95 ? 'bg-red-500' :
                systemStats.disk.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemStats.disk.percentage}%` }}
            />
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Wifi className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Network</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latency: {systemStats.network.latency}ms</p>
              </div>
            </div>
            {getStatusIcon(systemStats.network.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Upload:</span>
              <span className="text-gray-900 dark:text-white">{systemStats.network.bandwidth.upload} Mbps</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Download:</span>
              <span className="text-gray-900 dark:text-white">{systemStats.network.bandwidth.download} Mbps</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Database</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{systemStats.database.connections} connections</p>
              </div>
            </div>
            {getStatusIcon(systemStats.database.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Queries/min:</span>
              <span className="text-gray-900 dark:text-white">{systemStats.database.queries}</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Active Users</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Currently online</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {systemStats.activeUsers}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Response Time</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(performanceMetrics.responseTime, { warning: 200, critical: 300 })}`}>
              {performanceMetrics.responseTime}ms
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">API Calls</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {performanceMetrics.apiCalls.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {performanceMetrics.apiCalls.failed} failed
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Error Rate</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(performanceMetrics.errorRate, { warning: 2, critical: 5 })}`}>
              {performanceMetrics.errorRate.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Uptime</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {performanceMetrics.uptime.percentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {performanceMetrics.uptime.duration}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Cache Hit Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {performanceMetrics.cacheHitRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Error Logs</h3>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            View All Logs
          </button>
        </div>
        <div className="space-y-3">
          {errorLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{log.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}