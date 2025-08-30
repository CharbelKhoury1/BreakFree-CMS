import { supabase } from '../lib/supabase';
import { isDevelopmentMode, withDevelopmentFallback, mockData } from '../utils/developmentMode';
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

    // Generate excerpt if not provided
    let excerpt = blogData.excerpt;
    if (!excerpt && blogData.content) {
      excerpt = this.generateExcerpt(blogData.content);
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        ...blogData,
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
    console.log('BlogService.updateBlog called with:', { id, updates });
    
    // Check authentication first
    const currentUser = await supabase.auth.getUser();
    console.log('Current user:', currentUser.data.user?.id);
    
    if (!currentUser.data.user) {
      console.error('No authenticated user found');
      throw new Error('Authentication required');
    }

    const updateData: any = { 
      ...updates, 
      updated_at: new Date().toISOString() 
    };

    // Generate excerpt if content changed but no excerpt provided
    if (updates.content && !updates.excerpt) {
      updateData.excerpt = this.generateExcerpt(updates.content);
    }

    console.log('Update data being sent to Supabase:', updateData);

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!blogs_author_id_fkey(id, full_name, email)
      `)
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error details:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      console.error('No data returned from update operation');
      throw new Error('No data returned from update operation');
    }
    
    console.log('Update successful, returning data:', data);
    return data;
  }

  async deleteBlog(id: string): Promise<void> {
    console.log('BlogService.deleteBlog called with id:', id);
    
    // Check authentication first
    const currentUser = await supabase.auth.getUser();
    console.log('Current user for delete:', currentUser.data.user?.id);
    
    if (!currentUser.data.user) {
      console.error('No authenticated user found for delete');
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    console.log('Delete operation result:', { error });

    if (error) {
      console.error('Delete error details:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
    
    console.log('Delete successful for blog id:', id);
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
    return withDevelopmentFallback(
      async () => {
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
      },
      mockData.blogs,
      'getBlogs'
    );
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
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 50MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
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