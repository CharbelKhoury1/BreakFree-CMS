export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  author_id: string;
  published: boolean;
  featured_image: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface CreateBlogInput {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  published?: boolean;
  featured_image?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateBlogInput {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  published?: boolean;
  featured_image?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface GetBlogsOptions {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  published?: boolean;
  author_id?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'view_count';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedBlogs {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}