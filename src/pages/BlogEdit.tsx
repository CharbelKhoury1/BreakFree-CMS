import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { BlogEditor } from '../components/Blog/BlogEditor';
import { useBlog } from '../hooks/useBlogs';
import { BlogService } from '../services/blogService';
import type { UpdateBlogInput } from '../types/blog';

const blogService = new BlogService();

export function BlogEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blog, loading, error } = useBlog(id || null);

  const handleSave = async (data: UpdateBlogInput) => {
    if (!id) return;
    
    try {
      await blogService.updateBlog(id, data);
      // Don't navigate away on auto-save, only on manual save
      if (data.published !== undefined) {
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/blogs');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !blog) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading blog: {error}</p>
          <button onClick={() => navigate('/blogs')} className="mt-4">
            Back to Blog List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BlogEditor 
        blog={blog}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}