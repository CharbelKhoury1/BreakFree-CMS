export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'user' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'user' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'user' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          author_id: string;
          published: boolean;
          featured_image: string | null;
          tags: string[];
          meta_title: string | null;
          meta_description: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          author_id: string;
          published?: boolean;
          featured_image?: string | null;
          tags?: string[];
          meta_title?: string | null;
          meta_description?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          author_id?: string;
          published?: boolean;
          featured_image?: string | null;
          tags?: string[];
          meta_title?: string | null;
          meta_description?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      increment_blog_views: {
        Args: { blog_id: string };
        Returns: void;
      };
    };
  };
}