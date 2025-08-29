import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, FileText } from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your blog overview.</p>
          </div>
          <Link to="/blogs/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/blogs/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Post
                </Button>
              </Link>
              <Link to="/blogs" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Posts
                </Button>
              </Link>
              <Link to="/settings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Content Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average views per post</span>
                  <span className="font-semibold">
                    {stats.totalBlogs > 0 ? Math.round(stats.totalViews / stats.totalBlogs) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Published content</span>
                  <span className="font-semibold">
                    {stats.totalBlogs > 0 ? Math.round((stats.publishedBlogs / stats.totalBlogs) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Authentication</span>
                  <Badge variant="default">Secure</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}