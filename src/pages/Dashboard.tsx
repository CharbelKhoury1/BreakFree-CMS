import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, FileText } from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
// Replaced missing UI library components with basic elements
import { BlogService } from '../services/blogService';
import type { Blog } from '../types/blog';

const blogService = new BlogService();

export function Dashboard() {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalViews: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats and recent blogs in parallel
      const [allBlogs, publishedBlogs, recent] = await Promise.all([
        blogService.getBlogs({ limit: 1000 }), // Get all for stats
        blogService.getPublishedBlogs({ limit: 1000 }),
        blogService.getBlogs({ limit: 5, sortBy: 'updated_at', sortOrder: 'desc' }),
      ]);

      const totalViews = allBlogs.data.reduce((sum, blog) => sum + blog.view_count, 0);

      setStats({
        totalBlogs: allBlogs.total,
        publishedBlogs: publishedBlogs.total,
        totalViews,
      });

      setRecentBlogs(recent.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's your blog overview.</p>
          </div>
          <Link to="/blogs/new">
            <button className="inline-flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          totalBlogs={stats.totalBlogs}
          publishedBlogs={stats.publishedBlogs}
          totalViews={stats.totalViews}
          loading={loading}
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity recentBlogs={recentBlogs} loading={loading} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/blogs/new" className="block">
                <button className="w-full justify-start inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Post
                </button>
              </Link>
              <Link to="/blogs" className="block">
                <button className="w-full justify-start inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Posts
                </button>
              </Link>
              <Link to="/settings" className="block">
                <button className="w-full justify-start inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Settings
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Content Performance</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average views per post</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.totalBlogs > 0 ? Math.round(stats.totalViews / stats.totalBlogs) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Published content</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.totalBlogs > 0 ? Math.round((stats.publishedBlogs / stats.totalBlogs) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                  <span className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                  <span className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}