import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { BlogService } from '../../services/blogService';
import type { GetBlogsOptions } from '../../types/blog';

interface BlogFiltersProps {
  options: GetBlogsOptions;
  onOptionsChange: (options: Partial<GetBlogsOptions>) => void;
  onClear: () => void;
}

const blogService = new BlogService();

export function BlogFilters({ options, onOptionsChange, onClear }: BlogFiltersProps) {
  const [searchValue, setSearchValue] = useState(options.search || '');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onOptionsChange({ search: searchValue || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onOptionsChange]);

  useEffect(() => {
    blogService.getAllTags().then(setAvailableTags).catch(console.error);
  }, []);

  const activeFiltersCount = [
    options.search,
    options.tag,
    options.published !== undefined ? 'status' : null,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            placeholder="Search blogs..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex space-x-2">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 ml-1">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/20 z-10">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter by Status</h3>
                </div>
                <div className="p-2">
                  <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.published === true}
                      onChange={(e) => 
                        onOptionsChange({ published: e.target.checked ? true : undefined })
                      }
                      className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Published Only</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.published === false}
                      onChange={(e) => 
                        onOptionsChange({ published: e.target.checked ? false : undefined })
                      }
                      className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Drafts Only</span>
                  </label>
                </div>
                
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter by Tags</h3>
                </div>
                <div className="p-2 max-h-40 overflow-y-auto">
                  {availableTags.slice(0, 10).map((tag) => (
                    <label key={tag} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.tag === tag}
                        onChange={(e) => 
                          onOptionsChange({ tag: e.target.checked ? tag : undefined })
                        }
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="inline-flex items-center space-x-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {options.search && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <span>Search: {options.search}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" 
                onClick={() => {
                  setSearchValue('');
                  onOptionsChange({ search: undefined });
                }}
              />
            </span>
          )}
          {options.tag && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <span>Tag: {options.tag}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" 
                onClick={() => onOptionsChange({ tag: undefined })}
              />
            </span>
          )}
          {options.published !== undefined && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <span>Status: {options.published ? 'Published' : 'Draft'}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" 
                onClick={() => onOptionsChange({ published: undefined })}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}