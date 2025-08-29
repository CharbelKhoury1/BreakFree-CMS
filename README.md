# BreakFree Blog Admin Dashboard

A comprehensive, production-ready admin dashboard for managing blog content built with React, TypeScript, Supabase, and shadcn/ui.

## Features

- **Complete Authentication System**: Secure login with role-based access control
- **Blog Management**: Full CRUD operations with rich text editing
- **Media Management**: Image upload to Supabase Storage with optimization
- **SEO Tools**: Meta fields, auto-generated slugs, and content optimization
- **Advanced Filtering**: Search, tag filtering, and status-based filtering
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Real-time Updates**: Auto-save functionality and live preview
- **Performance Optimized**: Pagination, debounced search, and efficient queries

## Quick Setup

### 1. Environment Setup

1. Click the "Connect to Supabase" button in the top right corner
2. Follow the setup process to connect your Supabase project
3. The environment variables will be automatically configured

### 2. Database Setup

The project includes migration files that will create the necessary database structure:

- `profiles` table with user roles and authentication
- `blogs` table with full blog management capabilities
- Storage bucket for blog images
- Row Level Security (RLS) policies
- Database functions for slug generation and view counting

### 3. Admin User Creation

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create a new user with email: `admin@breakfree.com`
4. Run the admin user migration to assign admin role

### 4. Start Development

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Blog/           # Blog management components
│   ├── Layout/         # Layout components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
├── services/           # Business logic services
└── types/              # TypeScript type definitions

supabase/
└── migrations/         # Database migration files
```

## Key Components

### Authentication
- Role-based access control with admin-only dashboard access
- Secure session management with Supabase Auth
- Profile management with role assignment

### Blog Management
- Rich text editor with live preview using TipTap
- Image upload and management with Supabase Storage
- Auto-generated slugs and excerpts
- Tag management with autocomplete
- SEO optimization tools
- Draft/published workflow

### Dashboard
- Real-time metrics and statistics
- Recent activity feed
- Quick action shortcuts
- Performance insights

## Security Features

- Row Level Security (RLS) on all database tables
- Admin-only access enforcement
- Secure file upload validation
- XSS prevention with content sanitization
- CSRF protection measures

## Performance Optimizations

- Efficient pagination with database-level limits
- Debounced search queries (300ms delay)
- Optimistic UI updates for immediate feedback
- Image optimization and lazy loading
- Auto-save functionality with visual indicators

## Production Deployment

1. Ensure all environment variables are set correctly
2. Run database migrations in your production Supabase project
3. Create admin users through the Supabase dashboard
4. Deploy using your preferred hosting provider

## API Documentation

### BlogService
- `createBlog()`: Create new blog posts
- `updateBlog()`: Update existing posts
- `deleteBlog()`: Remove blog posts
- `getBlogs()`: Fetch paginated blog list with filtering
- `uploadImage()`: Handle image uploads to Supabase Storage

### AuthService
- `signIn()`: Authenticate admin users
- `signOut()`: Handle logout
- `getUserProfile()`: Fetch user profile data
- `updateProfile()`: Update user information
- `isAdmin()`: Check admin privileges

## Support

For issues or questions, please check the documentation or create an issue in the project repository.
</parameter>