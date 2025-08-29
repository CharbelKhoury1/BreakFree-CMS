import React, { useState, useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  RefreshCw,
  Power,
  Settings,
  Database,
  HardDrive,
  Wifi,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Play,
  Pause,
  Square,
  RotateCcw,
  FileText,
  Download,
  Upload,
  Shield,
  Zap,
  Activity,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  uptime: string;
  memory: string;
  cpu: string;
  description: string;
}

interface SystemAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => Promise<void>;
  confirmRequired: boolean;
  destructive?: boolean;
  category: 'cache' | 'maintenance' | 'services' | 'system';
}

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  scheduledEnd?: Date;
  reason: string;
}

const mockServices: ServiceStatus[] = [
  {
    id: 'web-server',
    name: 'Web Server',
    status: 'running',
    uptime: '7d 14h 23m',
    memory: '256MB',
    cpu: '12%',
    description: 'Main web application server'
  },
  {
    id: 'database',
    name: 'Database',
    status: 'running',
    uptime: '7d 14h 23m',
    memory: '512MB',
    cpu: '8%',
    description: 'PostgreSQL database server'
  },
  {
    id: 'cache-server',
    name: 'Cache Server',
    status: 'running',
    uptime: '7d 14h 23m',
    memory: '128MB',
    cpu: '3%',
    description: 'Redis cache server'
  },
  {
    id: 'background-jobs',
    name: 'Background Jobs',
    status: 'running',
    uptime: '7d 14h 23m',
    memory: '64MB',
    cpu: '5%',
    description: 'Background task processor'
  },
  {
    id: 'file-storage',
    name: 'File Storage',
    status: 'running',
    uptime: '7d 14h 23m',
    memory: '32MB',
    cpu: '1%',
    description: 'File upload and storage service'
  }
];

export function QuickActions() {
  const [services, setServices] = useState<ServiceStatus[]>(mockServices);
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceStatus>({
    enabled: false,
    message: 'System is operating normally',
    reason: ''
  });
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<SystemAction | null>(null);
  const [systemStats, setSystemStats] = useState({
    cacheSize: '2.3GB',
    tempFiles: '456MB',
    logSize: '1.2GB',
    uptime: '7 days, 14 hours'
  });

  const simulateAction = async (actionId: string, duration: number = 2000): Promise<void> => {
    setLoadingActions(prev => new Set(prev).add(actionId));
    await new Promise(resolve => setTimeout(resolve, duration));
    setLoadingActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(actionId);
      return newSet;
    });
  };

  const handleClearCache = async () => {
    await simulateAction('clear-cache');
    setSystemStats(prev => ({ ...prev, cacheSize: '0MB' }));
    toast.success('Cache cleared successfully');
  };

  const handleClearTempFiles = async () => {
    await simulateAction('clear-temp');
    setSystemStats(prev => ({ ...prev, tempFiles: '0MB' }));
    toast.success('Temporary files cleared');
  };

  const handleClearLogs = async () => {
    await simulateAction('clear-logs');
    setSystemStats(prev => ({ ...prev, logSize: '0MB' }));
    toast.success('Log files cleared');
  };

  const handleToggleMaintenanceMode = async () => {
    await simulateAction('maintenance-mode');
    setMaintenanceMode(prev => ({
      enabled: !prev.enabled,
      message: !prev.enabled ? 'System is in maintenance mode' : 'System is operating normally',
      scheduledEnd: !prev.enabled ? new Date(Date.now() + 2 * 60 * 60 * 1000) : undefined,
      reason: !prev.enabled ? 'Scheduled maintenance' : ''
    }));
    toast.success(`Maintenance mode ${maintenanceMode.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleRestartService = async (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, status: 'stopping' as const }
        : service
    ));
    
    await simulateAction(`restart-${serviceId}`, 3000);
    
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, status: 'starting' as const }
        : service
    ));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, status: 'running' as const, uptime: '0m' }
        : service
    ));
    
    toast.success(`${services.find(s => s.id === serviceId)?.name} restarted successfully`);
  };

  const handleRestartAllServices = async () => {
    await simulateAction('restart-all', 5000);
    setServices(prev => prev.map(service => ({ ...service, status: 'running' as const, uptime: '0m' })));
    toast.success('All services restarted successfully');
  };

  const handleSystemReboot = async () => {
    await simulateAction('system-reboot', 10000);
    toast.success('System reboot initiated');
  };

  const handleOptimizeDatabase = async () => {
    await simulateAction('optimize-db', 8000);
    toast.success('Database optimization completed');
  };

  const handleGenerateReport = async () => {
    await simulateAction('generate-report', 3000);
    // Simulate file download
    const reportData = {
      timestamp: new Date().toISOString(),
      services: services,
      maintenance: maintenanceMode,
      stats: systemStats
    };
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('System report generated and downloaded');
  };

  const systemActions: SystemAction[] = [
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: `Clear application cache (${systemStats.cacheSize})`,
      icon: Trash2,
      action: handleClearCache,
      confirmRequired: false,
      category: 'cache'
    },
    {
      id: 'clear-temp',
      title: 'Clear Temp Files',
      description: `Remove temporary files (${systemStats.tempFiles})`,
      icon: HardDrive,
      action: handleClearTempFiles,
      confirmRequired: false,
      category: 'cache'
    },
    {
      id: 'clear-logs',
      title: 'Clear Log Files',
      description: `Archive and clear logs (${systemStats.logSize})`,
      icon: FileText,
      action: handleClearLogs,
      confirmRequired: true,
      category: 'cache'
    },
    {
      id: 'maintenance-mode',
      title: maintenanceMode.enabled ? 'Disable Maintenance' : 'Enable Maintenance',
      description: maintenanceMode.enabled ? 'Exit maintenance mode' : 'Put system in maintenance mode',
      icon: AlertTriangle,
      action: handleToggleMaintenanceMode,
      confirmRequired: true,
      destructive: !maintenanceMode.enabled,
      category: 'maintenance'
    },
    {
      id: 'restart-all',
      title: 'Restart All Services',
      description: 'Restart all system services',
      icon: RefreshCw,
      action: handleRestartAllServices,
      confirmRequired: true,
      destructive: true,
      category: 'services'
    },
    {
      id: 'optimize-db',
      title: 'Optimize Database',
      description: 'Run database optimization and cleanup',
      icon: Database,
      action: handleOptimizeDatabase,
      confirmRequired: true,
      category: 'system'
    },
    {
      id: 'system-reboot',
      title: 'System Reboot',
      description: 'Reboot the entire system',
      icon: Power,
      action: handleSystemReboot,
      confirmRequired: true,
      destructive: true,
      category: 'system'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create system status report',
      icon: Download,
      action: handleGenerateReport,
      confirmRequired: false,
      category: 'system'
    }
  ];

  const getServiceStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'starting':
      case 'stopping':
        return <Loader className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getServiceStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-600 dark:text-green-400';
      case 'stopped':
        return 'text-red-600 dark:text-red-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'starting':
      case 'stopping':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const groupedActions = systemActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, SystemAction[]>);

  const categoryTitles = {
    cache: 'Cache Management',
    maintenance: 'Maintenance Mode',
    services: 'Service Management',
    system: 'System Operations'
  };

  const categoryIcons = {
    cache: HardDrive,
    maintenance: AlertTriangle,
    services: Server,
    system: Settings
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Perform common administrative tasks and system operations</p>
      </div>

      {/* Maintenance Mode Status */}
      {maintenanceMode.enabled && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Maintenance Mode Active</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{maintenanceMode.message}</p>
              {maintenanceMode.scheduledEnd && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Scheduled to end: {maintenanceMode.scheduledEnd.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{systemStats.cacheSize}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Cache Size</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{systemStats.tempFiles}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Temp Files</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{systemStats.logSize}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Log Files</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{systemStats.uptime}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        {Object.entries(groupedActions).map(([category, actions]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {categoryTitles[category as keyof typeof categoryTitles]}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {actions.map((action) => {
                    const ActionIcon = action.icon;
                    const isLoading = loadingActions.has(action.id);
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          if (action.confirmRequired) {
                            setConfirmAction(action);
                          } else {
                            action.action();
                          }
                        }}
                        disabled={isLoading}
                        className={`p-4 rounded-lg border transition-all text-left hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                          action.destructive
                            ? 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            action.destructive
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-indigo-100 dark:bg-indigo-900/30'
                          }`}>
                            {isLoading ? (
                              <Loader className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ActionIcon className={`h-5 w-5 ${
                                action.destructive
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-indigo-600 dark:text-indigo-400'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Services Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Status</h3>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {services.filter(s => s.status === 'running').length} of {services.length} running
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getServiceStatusIcon(service.status)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium capitalize ${getServiceStatusColor(service.status)}`}>
                      {service.status}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {service.status === 'running' && `Uptime: ${service.uptime}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">CPU: {service.cpu}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">RAM: {service.memory}</div>
                  </div>
                  <button
                    onClick={() => handleRestartService(service.id)}
                    disabled={service.status === 'starting' || service.status === 'stopping'}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Restart Service"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  confirmAction.destructive
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  <confirmAction.icon className={`h-6 w-6 ${
                    confirmAction.destructive
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Action</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{confirmAction.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{confirmAction.description}</p>
                {confirmAction.destructive && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                    ⚠️ This is a destructive action that may affect system availability.
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const action = confirmAction;
                    setConfirmAction(null);
                    await action.action();
                  }}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                    confirmAction.destructive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}