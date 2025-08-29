import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Blog } from '../../types/blog';

interface RecentActivityProps {
  recentBlogs: Blog[];
  loading?: boolean;
}

export function RecentActivity({ recentBlogs, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 border border-gray-100 dark:border-gray-700">
        <div className="pb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                  <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 border border-gray-100 dark:border-gray-700">
      <div className="pb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-4">
          {recentBlogs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            recentBlogs.map((blog) => (
              <div key={blog.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {blog.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {blog.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      blog.published 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(blog.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}