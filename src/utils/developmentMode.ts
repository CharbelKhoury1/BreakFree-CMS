// Development mode utilities
// This file helps manage development bypass functionality

export const DEVELOPMENT_BYPASS = false; // Set to false to enable real authentication

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
 * Generate a valid UUID v4 for development mode
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate dynamic mock data for development mode
 */
export const createMockData = (email?: string, fullName?: string) => {
  // Provide default email if none is provided
  const defaultEmail = email || 'user@example.com';
  
  // Add null check before calling split
  const userName = defaultEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Use provided full_name if available, otherwise generate from email
  const displayName = fullName || `${userName} (User)`;
  
  // Generate consistent UUIDs for development mode
  const userId = generateUUID();
  const blogId = generateUUID();
  
  return {
    user: {
      id: userId,
      email: defaultEmail,
      role: 'user'
    },
    profile: {
      id: userId,
      email: defaultEmail,
      full_name: displayName,
      role: 'user',
      bio: 'System User',
      avatar_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
  blogs: {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  stats: {
    totalBlogs: 0,
    publishedBlogs: 0,
    totalViews: 0
  }
  };
};

/**
 * Legacy mock data for backward compatibility
 */
export const mockData = createMockData('user@example.com');