
import { CategoryDialog } from '@/components/crediario/diretorio/components/CategoryDialog';
import { FileDialog } from '@/components/crediario/diretorio/components/FileDialog';
import { DeleteFileDialog } from '@/components/crediario/diretorio/components/DeleteFileDialog';
import { FileViewer } from '@/components/crediario/diretorio/components/FileViewer';
import { DirectoryCategory } from '@/components/crediario/diretorio/types';

interface DirectoryDialogsProps {
  categoryDialogOpen: boolean;
  setCategoryDialogOpen: (open: boolean) => void;
  onAddCategory: (name: string, description: string) => Promise<void>;
  
  editCategoryDialogOpen: boolean;
  setEditCategoryDialogOpen: (open: boolean) => void;
  onUpdateCategory: (name: string, description: string) => Promise<void>;
  selectedCategory: DirectoryCategory | null;
  
  fileDialogOpen: boolean;
  setFileDialogOpen: (open: boolean) => void;
  onUpdateFile: (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => Promise<void>;
  
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  onDeleteFile: () => Promise<void>;
  
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  
  selectedFile: any | null;
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
      {/* Diálogos de categorias */}
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

      {/* Diálogos de arquivos */}
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
