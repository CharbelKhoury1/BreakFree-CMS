import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search blogs..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={options.published === true}
                onCheckedChange={(checked) => 
                  onOptionsChange({ published: checked ? true : undefined })
                }
              >
                Published Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={options.published === false}
                onCheckedChange={(checked) => 
                  onOptionsChange({ published: checked ? false : undefined })
                }
              >
                Drafts Only
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
              {availableTags.slice(0, 10).map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={options.tag === tag}
                  onCheckedChange={(checked) => 
                    onOptionsChange({ tag: checked ? tag : undefined })
                  }
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClear} className="flex items-center space-x-1">
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {options.search && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Search: {options.search}</span>
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  setSearchValue('');
                  onOptionsChange({ search: undefined });
                }}
              />
            </Badge>
          )}
          {options.tag && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Tag: {options.tag}</span>
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onOptionsChange({ tag: undefined })}
              />
            </Badge>
          )}
          {options.published !== undefined && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Status: {options.published ? 'Published' : 'Draft'}</span>
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onOptionsChange({ published: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}