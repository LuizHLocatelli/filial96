
export interface DirectoryCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DirectoryFile {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  category_id?: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type SortBy = 'name' | 'created_at' | 'file_type' | 'file_size';
export type SortOption = 'name' | 'date' | 'type' | 'size'; // Add this missing type
export type SortDirection = 'asc' | 'desc';
export type FileViewMode = 'grid' | 'list';
