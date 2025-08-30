import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  FileText
} from 'lucide-react';
import type { Blog } from '../../types/blog';

interface BlogTableProps {
  blogs: Blog[];
  loading?: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
  onTogglePublish: (blog: Blog) => void;
}

export function BlogTable({ blogs, loading, onEdit, onDelete, onTogglePublish }: BlogTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No blog posts found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first blog post.</p>
        <Link to="/blogs/new">
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Create New Post
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {blog.title}
                    </h3>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                            +{blog.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    blog.published 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{blog.author?.full_name || 'Unknown'}</p>
                    <p className="text-gray-500 dark:text-gray-400">{blog.author?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1 text-gray-900 dark:text-white">
                    <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{blog.view_count.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative">
                    <button
                      ref={openDropdown === blog.id ? buttonRef : null}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (openDropdown === blog.id) {
                          setOpenDropdown(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.bottom + window.scrollY + 8,
                            left: rect.right - 192 + window.scrollX // 192px is dropdown width (w-48)
                          });
                          setOpenDropdown(blog.id);
                        }
                      }}
                      className="inline-flex items-center p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Portal-rendered dropdown to avoid overflow constraints */}
      {openDropdown && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/20 z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const blog = blogs.find(b => b.id === openDropdown);
                if (blog) onEdit(blog);
                setOpenDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const blog = blogs.find(b => b.id === openDropdown);
                if (blog) onTogglePublish(blog);
                setOpenDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              {blogs.find(b => b.id === openDropdown)?.published ? 'Unpublish' : 'Publish'}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Post
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const blog = blogs.find(b => b.id === openDropdown);
                if (blog) onDelete(blog);
                setOpenDropdown(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}