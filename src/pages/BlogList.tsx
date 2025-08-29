import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { BlogTable } from '../components/Blog/BlogTable';
import { BlogFilters } from '../components/Blog/BlogFilters';
import { Button } from '../components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
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
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-600">Manage your blog content</p>
          </div>
          <Link to="/blogs/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Button>
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
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, blogs.page - 1))}
                  className={blogs.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, blogs.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === blogs.page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(blogs.totalPages, blogs.page + 1))}
                  className={blogs.page >= blogs.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!blogToDelete} onOpenChange={() => setBlogToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}