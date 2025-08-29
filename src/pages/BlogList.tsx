import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { BlogTable } from '../components/Blog/BlogTable';
import { BlogFilters } from '../components/Blog/BlogFilters';
// Replace missing UI components with native elements
import { useBlogs } from '../hooks/useBlogs';
import { BlogService } from '../services/blogService';
import type { Blog } from '../types/blog';

const blogService = new BlogService();

export function BlogList() {
  const navigate = useNavigate();
  const { blogs, loading, error, options, updateOptions, refetch } = useBlogs({
    page: 1,
    limit: 10,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (blog: Blog) => {
    navigate(`/blogs/edit/${blog.id}`);
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;

    setDeleting(true);
    try {
      await blogService.deleteBlog(blogToDelete.id);
      setBlogToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      await blogService.updateBlog(blog.id, { published: !blog.published });
      refetch();
    } catch (error) {
      console.error('Error updating blog status:', error);
    }
  };

  const handlePageChange = (page: number) => {
    updateOptions({ page });
  };

  const clearFilters = () => {
    updateOptions({
      search: undefined,
      tag: undefined,
      published: undefined,
      page: 1,
    });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading blogs: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your blog content</p>
          </div>
          <Link to="/blogs/new">
            <button className="inline-flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </button>
          </Link>
        </div>

        {/* Filters */}
        <BlogFilters 
          options={options}
          onOptionsChange={updateOptions}
          onClear={clearFilters}
        />

        {/* Blog Table */}
        <BlogTable
          blogs={blogs.data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setBlogToDelete}
          onTogglePublish={handleTogglePublish}
        />

        {/* Pagination */}
        {blogs.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, blogs.page - 1))}
              className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${blogs.page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, blogs.totalPages) }, (_, i) => {
              const page = i + 1;
              const isActive = page === blogs.page;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded ${isActive ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(Math.min(blogs.totalPages, blogs.page + 1))}
              className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${blogs.page >= blogs.totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Next
            </button>
          </div>
        )}

        {/* Simple Delete Confirmation */}
        {blogToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 max-w-sm w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Blog Post</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete "{blogToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setBlogToDelete(null)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}