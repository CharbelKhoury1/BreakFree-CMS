import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useDropzone } from 'react-dropzone';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Upload,
  X,
  Save,
  Eye
} from 'lucide-react';
import { BlogService } from '../../services/blogService';
import type { Blog, CreateBlogInput, UpdateBlogInput } from '../../types/blog';

interface BlogEditorProps {
  blog?: Blog;
  onSave: (data: CreateBlogInput | UpdateBlogInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const blogService = new BlogService();

export function BlogEditor({ blog, onSave, onCancel, loading }: BlogEditorProps) {
  const [title, setTitle] = useState(blog?.title || '');
  const [content, setContent] = useState(blog?.content || '');
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '');

  const [published, setPublished] = useState(blog?.published || false);
  const [featuredImage, setFeaturedImage] = useState(blog?.featured_image || '');
  const [tags, setTags] = useState<string[]>(blog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [metaTitle, setMetaTitle] = useState(blog?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(blog?.meta_description || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [saveError, setSaveError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log('Editor content updated:', newContent);
      setContent(newContent);
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!blog?.id) return;

    const timeoutId = setTimeout(async () => {
      if (title && content && content.trim() !== '' && content !== '<p></p>') {
        console.log('Auto-save triggered');
        setAutoSaving(true);
        try {
          await onSave({
            title,
            content,
            excerpt,
            published,
            featured_image: featuredImage,
            tags,
            meta_title: metaTitle,
            meta_description: metaDescription,
          });
          console.log('Auto-save completed');
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [title, content, excerpt, published, featuredImage, tags, metaTitle, metaDescription]);



  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: async (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          setUploadError('File size too large. Maximum size is 50MB.');
        } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
          setUploadError('Invalid file type. Please upload an image file.');
        } else {
          setUploadError('File upload failed. Please try again.');
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setUploadError(null);
      try {
        const imageUrl = await blogService.uploadImage(file);
        setFeaturedImage(imageUrl);
        setUploadError(null);
      } catch (error) {
        console.error('Upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
        setUploadError(errorMessage);
      } finally {
        setUploading(false);
      }
    },
  });

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null); // Clear any previous errors
    
    console.log('Save button clicked - handleSubmit called');
    console.log('Form data:', {
      title,
      content,
      excerpt,
      published,
      featured_image: featuredImage,
      tags,
      meta_title: metaTitle,
      meta_description: metaDescription,
    });
    
    try {
      console.log('Calling onSave function...');
      await onSave({
        title,
        content,
        excerpt,
        published,
        featured_image: featuredImage,
        tags,
        meta_title: metaTitle,
        meta_description: metaDescription,
      });
      console.log('onSave completed successfully');
      setSaveError(null); // Clear error on success
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSaveError(errorMessage);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {blog ? 'Edit Post' : 'Create New Post'}
        </h1>
        <div className="flex items-center space-x-3">
          {autoSaving && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin mr-2" />
              Auto-saving...
            </span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading || !title || (!content || content.trim() === '' || content === '<p></p>')}
            onClick={() => {
              console.log('Save button clicked!');
              console.log('Button disabled?', loading || !title || (!content || content.trim() === '' || content === '<p></p>'));
              console.log('Loading:', loading);
              console.log('Title:', title);
              console.log('Content:', content);
              console.log('Content length:', content?.length);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Post'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error saving blog post
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{saveError}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setSaveError(null)}
                  className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md p-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6">
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Post Content</h2>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>



              {/* Simple Tabs */}
              <div className="w-full">
                <div className="flex border-b border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'editor'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'preview'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Preview
                  </button>
                </div>
                
                {activeTab === 'editor' && (
                  <div className="space-y-2">
                    {/* Editor Toolbar */}
                    <div className="flex items-center space-x-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-t-lg border border-gray-300 dark:border-gray-600">
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded text-gray-700 dark:text-gray-300 ${
                          editor.isActive('bold') 
                            ? 'bg-gray-200 dark:bg-gray-600' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded text-gray-700 dark:text-gray-300 ${
                          editor.isActive('italic') 
                            ? 'bg-gray-200 dark:bg-gray-600' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded text-gray-700 dark:text-gray-300 ${
                          editor.isActive('bulletList') 
                            ? 'bg-gray-200 dark:bg-gray-600' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded text-gray-700 dark:text-gray-300 ${
                          editor.isActive('orderedList') 
                            ? 'bg-gray-200 dark:bg-gray-600' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded text-gray-700 dark:text-gray-300 ${
                          editor.isActive('blockquote') 
                            ? 'bg-gray-200 dark:bg-gray-600' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Quote className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        <Undo className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        <Redo className="w-4 h-4" />
                      </button>
                    </div>

                    <EditorContent 
                      editor={editor} 
                      className="min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    />
                  </div>
                )}
                
                {activeTab === 'preview' && (
                  <div 
                    className="min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                )}
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post (optional - will be auto-generated)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6">
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Publish Settings</h2>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish immediately</label>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6">
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Image</h2>
            </div>
            <div className="p-6 pt-0">
              {featuredImage ? (
                <div className="space-y-3">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage('');
                      setUploadError(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      uploadError 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div className="space-y-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click or drag to upload an image
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Supports: JPEG, PNG, GIF, WebP (max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6">
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Type a tag and press Enter"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => removeTag(tag)}
                    >
                      <span>{tag}</span>
                      <X className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6">
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h2>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label>
                <input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}