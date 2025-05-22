
// Types for the directory feature
export type FileViewMode = 'grid' | 'list';

export type SortOption = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface DirectoryCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface DirectoryFile {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  category_id?: string;
  is_featured?: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
}
