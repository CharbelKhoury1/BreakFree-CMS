// Development mode utilities
// This file helps manage development bypass functionality

export const DEVELOPMENT_BYPASS = true; // Set to false to enable real authentication

/**
 * Check if development bypass is enabled
 */
export const isDevelopmentMode = (): boolean => {
  return DEVELOPMENT_BYPASS;
};

/**
 * Wrapper for Supabase operations that respects development mode
 */
export const withDevelopmentFallback = async <T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName?: string
): Promise<T> => {
  if (isDevelopmentMode()) {
    console.log(`🔄 Development mode: Skipping ${operationName || 'operation'}, returning fallback value`);
    return fallbackValue;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error(`❌ ${operationName || 'Operation'} failed:`, error);
    
    // In development mode, return fallback on error
    if (isDevelopmentMode()) {
      console.log(`🔄 Development mode: Returning fallback value due to error`);
      return fallbackValue;
    }
    
    throw error;
  }
};

/**
 * Mock data for development mode
 */
export const mockData = {
  user: {
    id: 'temp-user-id',
    email: 'admin@breakfree.com',
    role: 'admin'
  },
  profile: {
    id: 'temp-user-id',
    email: 'admin@breakfree.com',
    full_name: 'Admin User',
    role: 'admin',
    bio: 'System Administrator',
    avatar_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  blogs: {
    data: [
      {
        id: '1',
        title: 'Welcome to BreakFree CMS',
        content: 'This is a sample blog post in development mode.',
        excerpt: 'Sample blog post for development.',
        published: true,
        featured_image: '',
        tags: ['welcome', 'cms'],
        view_count: 42,
        author_id: 'temp-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          id: 'temp-user-id',
          full_name: 'Admin User',
          email: 'admin@breakfree.com'
        }
      }
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  },
  stats: {
    totalBlogs: 1,
    publishedBlogs: 1,
    totalViews: 42
  }
};