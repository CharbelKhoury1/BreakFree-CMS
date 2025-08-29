import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  Calendar,
  Clock,
  FileText,
  Archive,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Settings,
  Cloud,
  HardDrive,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Loader2,
  Info,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  created: string;
  status: 'completed' | 'failed' | 'in_progress';
  location: 'local' | 'cloud';
  integrity: boolean;
}

interface ExportJob {
  id: string;
  name: string;
  type: 'posts' | 'media' | 'users' | 'all';
  format: 'json' | 'xml' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created: string;
  size?: string;
}

interface ImportJob {
  id: string;
  fileName: string;
  type: 'posts' | 'media' | 'users' | 'mixed';
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed';
  progress: number;
  conflicts: number;
  imported: number;
  total: number;
  created: string;
}

interface ScheduledBackup {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  type: 'full' | 'incremental';
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

export function BackupExport() {
  const [activeTab, setActiveTab] = useState<'backup' | 'export' | 'import'>('backup');
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: '1',
      name: 'Full Backup - 2024-01-15',
      type: 'full',
      size: '2.4 GB',
      created: '2024-01-15 14:30:00',
      status: 'completed',
      location: 'cloud',
      integrity: true
    },
    {
      id: '2',
      name: 'Incremental Backup - 2024-01-14',
      type: 'incremental',
      size: '156 MB',
      created: '2024-01-14 02:00:00',
      status: 'completed',
      location: 'local',
      integrity: true
    },
    {
      id: '3',
      name: 'Full Backup - 2024-01-10',
      type: 'full',
      size: '2.3 GB',
      created: '2024-01-10 14:30:00',
      status: 'failed',
      location: 'cloud',
      integrity: false
    }
  ]);

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Blog Posts Export',
      type: 'posts',
      format: 'json',
      status: 'completed',
      progress: 100,
      created: '2024-01-15 10:30:00',
      size: '45 MB'
    },
    {
      id: '2',
      name: 'Media Files Export',
      type: 'media',
      format: 'json',
      status: 'processing',
      progress: 67,
      created: '2024-01-15 11:15:00'
    }
  ]);

  const [importJobs, setImportJobs] = useState<ImportJob[]>([
    {
      id: '1',
      fileName: 'wordpress_export.xml',
      type: 'posts',
      status: 'completed',
      progress: 100,
      conflicts: 3,
      imported: 247,
      total: 250,
      created: '2024-01-14 16:20:00'
    },
    {
      id: '2',
      fileName: 'user_data.csv',
      type: 'users',
      status: 'validating',
      progress: 25,
      conflicts: 0,
      imported: 0,
      total: 1500,
      created: '2024-01-15 09:45:00'
    }
  ]);

  const [scheduledBackups, setScheduledBackups] = useState<ScheduledBackup[]>([
    {
      id: '1',
      name: 'Daily Incremental',
      frequency: 'daily',
      time: '02:00',
      type: 'incremental',
      enabled: true,
      lastRun: '2024-01-15 02:00:00',
      nextRun: '2024-01-16 02:00:00'
    },
    {
      id: '2',
      name: 'Weekly Full Backup',
      frequency: 'weekly',
      time: '14:30',
      type: 'full',
      enabled: true,
      lastRun: '2024-01-15 14:30:00',
      nextRun: '2024-01-22 14:30:00'
    }
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup form state
  const [backupForm, setBackupForm] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental',
    location: 'cloud' as 'local' | 'cloud',
    compression: true,
    encryption: true
  });

  // Export form state
  const [exportForm, setExportForm] = useState({
    name: '',
    type: 'posts' as 'posts' | 'media' | 'users' | 'all',
    format: 'json' as 'json' | 'xml' | 'csv',
    dateRange: 'all' as 'all' | 'last_month' | 'last_year' | 'custom',
    includeMedia: true,
    includeComments: true
  });

  // Import form state
  const [importForm, setImportForm] = useState({
    file: null as File | null,
    type: 'auto' as 'auto' | 'posts' | 'media' | 'users',
    conflictResolution: 'skip' as 'skip' | 'overwrite' | 'merge',
    validateOnly: false
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    type: 'incremental' as 'full' | 'incremental',
    retention: 30
  });

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    
    // Simulate backup creation
    setTimeout(() => {
      const newBackup: BackupItem = {
        id: Date.now().toString(),
        name: backupForm.name || `${backupForm.type} Backup - ${new Date().toLocaleDateString()}`,
        type: backupForm.type,
        size: backupForm.type === 'full' ? '2.5 GB' : '180 MB',
        created: new Date().toISOString(),
        status: 'completed',
        location: backupForm.location,
        integrity: true
      };
      
      setBackups(prev => [newBackup, ...prev]);
      setIsCreatingBackup(false);
      setShowBackupModal(false);
      setBackupForm({ name: '', type: 'full', location: 'cloud', compression: true, encryption: true });
      toast.success('Backup created successfully');
    }, 3000);
  };

  const handleCreateExport = async () => {
    const newExport: ExportJob = {
      id: Date.now().toString(),
      name: exportForm.name || `${exportForm.type} Export`,
      type: exportForm.type,
      format: exportForm.format,
      status: 'processing',
      progress: 0,
      created: new Date().toISOString()
    };
    
    setExportJobs(prev => [newExport, ...prev]);
    setShowExportModal(false);
    setExportForm({ name: '', type: 'posts', format: 'json', dateRange: 'all', includeMedia: true, includeComments: true });
    
    // Simulate export progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExportJobs(prev => prev.map(job => 
          job.id === newExport.id 
            ? { ...job, status: 'completed', progress: 100, size: '45 MB' }
            : job
        ));
        toast.success('Export completed successfully');
      } else {
        setExportJobs(prev => prev.map(job => 
          job.id === newExport.id 
            ? { ...job, progress: Math.round(progress) }
            : job
        ));
      }
    }, 500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportForm(prev => ({ ...prev, file }));
    }
  };

  const handleStartImport = async () => {
    if (!importForm.file) {
      toast.error('Please select a file to import');
      return;
    }

    const newImport: ImportJob = {
      id: Date.now().toString(),
      fileName: importForm.file.name,
      type: importForm.type === 'auto' ? 'mixed' : importForm.type,
      status: 'validating',
      progress: 0,
      conflicts: 0,
      imported: 0,
      total: Math.floor(Math.random() * 1000) + 100,
      created: new Date().toISOString()
    };
    
    setImportJobs(prev => [newImport, ...prev]);
    setShowImportModal(false);
    setImportForm({ file: null, type: 'auto', conflictResolution: 'skip', validateOnly: false });
    
    // Simulate import process
    setTimeout(() => {
      setImportJobs(prev => prev.map(job => 
        job.id === newImport.id 
          ? { ...job, status: 'processing', progress: 10, conflicts: Math.floor(Math.random() * 10) }
          : job
      ));
      
      let progress = 10;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setImportJobs(prev => prev.map(job => 
            job.id === newImport.id 
              ? { ...job, status: 'completed', progress: 100, imported: job.total - job.conflicts }
              : job
          ));
          toast.success('Import completed successfully');
        } else {
          setImportJobs(prev => prev.map(job => 
            job.id === newImport.id 
              ? { ...job, progress: Math.round(progress), imported: Math.floor((progress / 100) * job.total) }
              : job
          ));
        }
      }, 800);
    }, 2000);
  };

  const handleCreateSchedule = () => {
    const newSchedule: ScheduledBackup = {
      id: Date.now().toString(),
      name: scheduleForm.name,
      frequency: scheduleForm.frequency,
      time: scheduleForm.time,
      type: scheduleForm.type,
      enabled: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    setScheduledBackups(prev => [newSchedule, ...prev]);
    setShowScheduleModal(false);
    setScheduleForm({ name: '', frequency: 'daily', time: '02:00', type: 'incremental', retention: 30 });
    toast.success('Backup schedule created successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'in_progress':
      case 'validating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Backup & Export</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage data backups, exports, and imports</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBackupModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>New Backup</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'backup', label: 'Database Backup', icon: Database },
            { id: 'export', label: 'Export Content', icon: Download },
            { id: 'import', label: 'Import Data', icon: Upload }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Scheduled Backups */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scheduled Backups</h3>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Schedule</span>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {scheduledBackups.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        schedule.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <Calendar className={`h-4 w-4 ${
                          schedule.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{schedule.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {schedule.frequency} at {schedule.time} ({schedule.type})
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Next run: {new Date(schedule.nextRun).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setScheduledBackups(prev => prev.map(s => 
                            s.id === schedule.id ? { ...s, enabled: !s.enabled } : s
                          ));
                          toast.success(`Schedule ${schedule.enabled ? 'disabled' : 'enabled'}`);
                        }}
                        className={`p-1 rounded ${
                          schedule.enabled 
                            ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {schedule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Backup History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backup History</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        backup.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        backup.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <Archive className={`h-5 w-5 ${
                          backup.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          backup.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">{backup.name}</p>
                          {getStatusIcon(backup.status)}
                          {backup.location === 'cloud' && <Cloud className="h-4 w-4 text-blue-500" />}
                          {backup.location === 'local' && <HardDrive className="h-4 w-4 text-gray-500" />}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{backup.type} backup</span>
                          <span>{backup.size}</span>
                          <span>{new Date(backup.created).toLocaleString()}</span>
                          {backup.integrity && <span className="text-green-600 dark:text-green-400">✓ Verified</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {backup.status === 'completed' && (
                        <>
                          <button className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Jobs</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        job.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        job.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          job.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          job.status === 'processing' ? 'text-blue-600 dark:text-blue-400' :
                          job.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">{job.name}</p>
                          {getStatusIcon(job.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{job.type} export</span>
                          <span>{job.format.toUpperCase()}</span>
                          <span>{new Date(job.created).toLocaleString()}</span>
                          {job.size && <span>{job.size}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === 'completed' && (
                        <button className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {job.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(job.progress)}`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Jobs</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {importJobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        job.status === 'processing' || job.status === 'validating' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        job.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <Upload className={`h-5 w-5 ${
                          job.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          job.status === 'processing' || job.status === 'validating' ? 'text-blue-600 dark:text-blue-400' :
                          job.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">{job.fileName}</p>
                          {getStatusIcon(job.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{job.type} import</span>
                          <span>{job.imported}/{job.total} items</span>
                          {job.conflicts > 0 && (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              {job.conflicts} conflicts
                            </span>
                          )}
                          <span>{new Date(job.created).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.conflicts > 0 && job.status === 'completed' && (
                        <button className="p-2 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30 rounded-lg transition-colors">
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {(job.status === 'processing' || job.status === 'validating') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {job.status === 'validating' ? 'Validating' : 'Importing'}
                        </span>
                        <span className="text-gray-900 dark:text-white">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(job.progress)}`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Backup</h3>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Backup Name
                  </label>
                  <input
                    type="text"
                    value={backupForm.name}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Optional custom name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Backup Type
                  </label>
                  <select
                    value={backupForm.type}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, type: e.target.value as 'full' | 'incremental' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="full">Full Backup</option>
                    <option value="incremental">Incremental Backup</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Storage Location
                  </label>
                  <select
                    value={backupForm.location}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, location: e.target.value as 'local' | 'cloud' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="cloud">Cloud Storage</option>
                    <option value="local">Local Storage</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupForm.compression}
                      onChange={(e) => setBackupForm(prev => ({ ...prev, compression: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable compression</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupForm.encryption}
                      onChange={(e) => setBackupForm(prev => ({ ...prev, encryption: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable encryption</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isCreatingBackup && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isCreatingBackup ? 'Creating...' : 'Create Backup'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Name
                  </label>
                  <input
                    type="text"
                    value={exportForm.name}
                    onChange={(e) => setExportForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Optional custom name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={exportForm.type}
                    onChange={(e) => setExportForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="posts">Blog Posts</option>
                    <option value="media">Media Files</option>
                    <option value="users">Users</option>
                    <option value="all">All Content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Format
                  </label>
                  <select
                    value={exportForm.format}
                    onChange={(e) => setExportForm(prev => ({ ...prev, format: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <select
                    value={exportForm.dateRange}
                    onChange={(e) => setExportForm(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                {exportForm.type === 'posts' && (
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportForm.includeMedia}
                        onChange={(e) => setExportForm(prev => ({ ...prev, includeMedia: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include media files</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportForm.includeComments}
                        onChange={(e) => setExportForm(prev => ({ ...prev, includeComments: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include comments</span>
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExport}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Start Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            accept=".json,.xml,.csv"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JSON, XML, CSV up to 10MB
                      </p>
                      {importForm.file && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          Selected: {importForm.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={importForm.type}
                    onChange={(e) => setImportForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="posts">Blog Posts</option>
                    <option value="media">Media Files</option>
                    <option value="users">Users</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conflict Resolution
                  </label>
                  <select
                    value={importForm.conflictResolution}
                    onChange={(e) => setImportForm(prev => ({ ...prev, conflictResolution: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="skip">Skip duplicates</option>
                    <option value="overwrite">Overwrite existing</option>
                    <option value="merge">Merge data</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={importForm.validateOnly}
                      onChange={(e) => setImportForm(prev => ({ ...prev, validateOnly: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Validate only (don't import)</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartImport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {importForm.validateOnly ? 'Validate' : 'Start Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Backup</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Daily Backup"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Backup Type
                  </label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="incremental">Incremental</option>
                    <option value="full">Full Backup</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Retention (days)
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.retention}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSchedule}
                  disabled={!scheduleForm.name}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}