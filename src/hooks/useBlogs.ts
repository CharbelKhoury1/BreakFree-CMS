import { useState, useEffect, useCallback } from 'react';
import { BlogService } from '../services/blogService';
import type { Blog, GetBlogsOptions, PaginatedBlogs } from '../types/blog';

const blogService = new BlogService();

export function useBlogs(initialOptions: GetBlogsOptions = {}) {
  const [blogs, setBlogs] = useState<PaginatedBlogs>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<GetBlogsOptions>(initialOptions);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.getBlogs(options);
      setBlogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const updateOptions = useCallback((newOptions: Partial<GetBlogsOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const refetch = useCallback(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    loading,
    error,
    options,
    updateOptions,
    refetch,
  };
}

export function useBlog(id: string | null) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await blogService.getBlogById(id);
      setBlog(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  return {
    blog,
    loading,
    error,
    refetch: fetchBlog,
  };
}