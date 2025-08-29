import React from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { BackupExport } from '../../components/Admin/BackupExport';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackupExportPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Panel</span>
          </button>
          <span className="text-gray-400">/</span>
          <div className="flex items-center space-x-2">
            <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-gray-900 dark:text-white font-medium">Backup & Export</span>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Export</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage database backups, content export, and data import operations</p>
        </div>

        {/* Backup Export Component */}
        <BackupExport />
      </div>
    </DashboardLayout>
  );
}