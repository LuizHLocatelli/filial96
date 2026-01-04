/**
 * Tipos compartilhados para o módulo de Diretório
 */

export interface DirectoryFile {
  id: string;
  name: string;
  category_id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at?: string;
  description?: string;
}

export interface DirectoryCategory {
  id: string;
  name: string;
  description?: string;
  sector: string;
  created_at: string;
  updated_at?: string;
}

export interface UseDirectoryConfig {
  /** Setor/tabela (ex: 'moda', 'crediario', 'moveis') */
  sector: string;
  /** Descrição para o header */
  description: string;
}

export interface FileOperationProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "name" | "date" | "size" | "type";
  sortDirection: "asc" | "desc";
  handleSortChange: (by: "name" | "date" | "size" | "type") => void;
  sortedFiles: DirectoryFile[];
  handleViewFile: (file: DirectoryFile) => void;
  handleDeleteFile: (file: DirectoryFile) => void;
  handleEditFile: (file: DirectoryFile) => void;
  fileDialogOpen: boolean;
  setFileDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  selectedFile: DirectoryFile | null;
  setSelectedFile: (file: DirectoryFile | null) => void;
}

export interface CategoryOperationProps {
  categories: DirectoryCategory[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  categoryDialogOpen: boolean;
  setCategoryDialogOpen: (open: boolean) => void;
  editCategoryDialogOpen: boolean;
  setEditCategoryDialogOpen: (open: boolean) => void;
  selectedCategory: DirectoryCategory | null;
  handleAddCategory: (name: string, description: string) => Promise<void>;
  handleUpdateCategory: (name: string, description: string) => Promise<void>;
  handleEditCategory: (category: DirectoryCategory) => void;
  handleClearCategory: () => void;
}
