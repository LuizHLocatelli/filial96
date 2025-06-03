export interface DirectoryFile {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size?: number | null;
  category_id?: string | null;
  is_featured?: boolean;
  description?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface DirectoryCategory {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'created_at' | 'file_size' | 'file_type';
export type SortDirection = 'asc' | 'desc'; 