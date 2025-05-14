
export interface DirectoryCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface DirectoryFile {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export type FileViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';
