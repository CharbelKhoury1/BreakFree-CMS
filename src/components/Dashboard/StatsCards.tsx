import React from 'react';
import { FileText, Eye, Users, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalBlogs: number;
  publishedBlogs: number;
  totalViews: number;
  loading?: boolean;
}

export function StatsCards({ totalBlogs, publishedBlogs, totalViews, loading }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Posts',
      value: totalBlogs,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Published',
      value: publishedBlogs,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Draft Posts',
      value: totalBlogs - publishedBlogs,
      icon: Users,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6">
            <div className="pb-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            </div>
            <div className="p-6 pt-0">
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {stat.title}
            </h3>
            <div className={`w-8 h-8 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}