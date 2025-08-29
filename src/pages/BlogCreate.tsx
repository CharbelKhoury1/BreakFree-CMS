import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { BlogEditor } from '../components/Blog/BlogEditor';
import { BlogService } from '../services/blogService';
import type { CreateBlogInput } from '../types/blog';

const blogService = new BlogService();

export function BlogCreate() {
  const navigate = useNavigate();

  const handleSave = async (data: CreateBlogInput) => {
    try {
      await blogService.createBlog(data);
      navigate('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/blogs');
  };

  return (
    <DashboardLayout>
      <BlogEditor 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}