
import { CategoryDialog } from './CategoryDialog';
import { FileDialog } from './FileDialog';
import { DeleteFileDialog } from './DeleteFileDialog';
import { FileViewer } from './FileViewer';
import { DirectoryCategory, DirectoryFile } from '../types';

interface DirectoryDialogsProps {
  // Category dialogs
  categoryDialogOpen: boolean;
  setCategoryDialogOpen: (open: boolean) => void;
  onAddCategory: (name: string, description: string) => void;
  
  editCategoryDialogOpen: boolean;
  setEditCategoryDialogOpen: (open: boolean) => void;
  onUpdateCategory: (name: string, description: string) => void;
  selectedCategory: DirectoryCategory | null;
  
  // File dialogs
  fileDialogOpen: boolean;
  setFileDialogOpen: (open: boolean) => void;
  onUpdateFile: (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => void;
  
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  onDeleteFile: () => void;
  
  // File viewer
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  
  selectedFile: DirectoryFile | null;
  categories: DirectoryCategory[];
}

export function DirectoryDialogs({
  categoryDialogOpen,
  setCategoryDialogOpen,
  onAddCategory,
  
  editCategoryDialogOpen,
  setEditCategoryDialogOpen,
  onUpdateCategory,
  selectedCategory,
  
  fileDialogOpen,
  setFileDialogOpen,
  onUpdateFile,
  
  deleteDialogOpen,
  setDeleteDialogOpen,
  onDeleteFile,
  
  viewerOpen,
  setViewerOpen,
  
  selectedFile,
  categories,
}: DirectoryDialogsProps) {
  return (
    <>
      {/* Category Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSave={onAddCategory}
        title="Nova Categoria"
      />

      <CategoryDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
        onSave={onUpdateCategory}
        category={selectedCategory || undefined}
        title="Editar Categoria"
      />

      {/* File Dialogs */}
      {selectedFile && (
        <FileDialog
          open={fileDialogOpen}
          onOpenChange={setFileDialogOpen}
          onSave={onUpdateFile}
          file={selectedFile}
          categories={categories}
        />
      )}

      <DeleteFileDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={onDeleteFile}
        file={selectedFile}
      />

      <FileViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        file={selectedFile}
      />
    </>
  );
}
