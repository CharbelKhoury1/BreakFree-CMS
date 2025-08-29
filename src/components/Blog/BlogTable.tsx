import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  MoreVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Blog } from '../../types/blog';

interface BlogTableProps {
  blogs: Blog[];
  loading?: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
  onTogglePublish: (blog: Blog) => void;
}

export function BlogTable({ blogs, loading, onEdit, onDelete, onTogglePublish }: BlogTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first blog post.</p>
        <Link to="/blogs/new">
          <Button>Create New Post</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {blog.title}
                  </h3>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={blog.published ? 'default' : 'secondary'}>
                  {blog.published ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{blog.author?.full_name || 'Unknown'}</p>
                  <p className="text-gray-500">{blog.author?.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>{blog.view_count.toLocaleString()}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(blog)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTogglePublish(blog)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {blog.published ? 'Unpublish' : 'Publish'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(blog)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}