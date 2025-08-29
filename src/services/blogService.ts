import { supabase } from '../lib/supabase';
import type { 
  Blog, 
  CreateBlogInput, 
  UpdateBlogInput, 
  GetBlogsOptions, 
  PaginatedBlogs 
} from '../types/blog';

export class BlogService {
  async createBlog(blogData: CreateBlogInput): Promise<Blog> {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
      throw new Error('Authentication required');
    }

    // Generate slug if not provided
    let slug = blogData.slug;
    if (!slug) {
      slug = await this.generateSlug(blogData.title);
    }

    // Generate excerpt if not provided
    let excerpt = blogData.excerpt;
    if (!excerpt && blogData.content) {
      excerpt = this.generateExcerpt(blogData.content);
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        ...blogData,
        slug,
        excerpt,
        author_id: currentUser.data.user.id,
      })
      .select(`
        *,
        author:profiles!blogs_author_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateBlog(id: string, updates: UpdateBlogInput): Promise<Blog> {
    const updateData: any = { 
      ...updates, 
      updated_at: new Date().toISOString() 
    };

    // Generate new slug if title changed
    if (updates.title && !updates.slug) {
      updateData.slug = await this.generateSlug(updates.title);
    }

    // Generate excerpt if content changed but no excerpt provided
    if (updates.content && !updates.excerpt) {
      updateData.excerpt = this.generateExcerpt(updates.content);
    }

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!blogs_author_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBlog(id: string): Promise<void> {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getBlogById(id: string, incrementViews = false): Promise<Blog> {
    if (incrementViews) {
      await supabase.rpc('increment_blog_views', { blog_id: id });
    }

    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:profiles!blogs_author_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getBlogs(options: GetBlogsOptions = {}): Promise<PaginatedBlogs> {
    const {
      page = 1,
      limit = 10,
      search,
      tag,
      published,
      author_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('blogs')
      .select(`
        *,
        author:profiles!blogs_author_id_fkey(id, full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    if (published !== undefined) {
      query = query.eq('published', published);
    }

    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async getPublishedBlogs(options: GetBlogsOptions = {}): Promise<PaginatedBlogs> {
    return this.getBlogs({ ...options, published: true });
  }

  async getAllTags(): Promise<string[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('tags');

    if (error) throw error;

    const allTags = data?.reduce((acc: string[], blog) => {
      if (blog.tags) {
        acc.push(...blog.tags);
      }
      return acc;
    }, []) || [];

    return [...new Set(allTags)].sort();
  }

  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  private async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for existing slugs
    const { data, error } = await supabase
      .from('blogs')
      .select('slug')
      .ilike('slug', `${baseSlug}%`);

    if (error) throw error;

    if (!data || data.length === 0) {
      return baseSlug;
    }

    // Find the next available slug
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;
    
    while (data.some(blog => blog.slug === newSlug)) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    return newSlug;
  }

  private generateExcerpt(content: string, maxLength = 160): string {
    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find the last complete word within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }
}