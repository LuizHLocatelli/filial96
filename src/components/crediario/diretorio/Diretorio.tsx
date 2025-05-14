
import { useState } from 'react';
import { useDirectoryCategories } from './hooks/useDirectoryCategories';
import { useDirectoryFiles } from './hooks/useDirectoryFiles';
import { useCategoryOperations } from './hooks/useCategoryOperations';
import { useFileOperations } from './hooks/useFileOperations';
import { FileGrid } from './components/FileGrid';
import { FileList } from './components/FileList';
import { CategoryDialog } from './components/CategoryDialog';
import { FileDialog } from './components/FileDialog';
import { DeleteFileDialog } from './components/DeleteFileDialog';
import { FileViewer } from './components/FileViewer';
import { DirectoryToolbar } from './components/DirectoryToolbar';
import { CategoryFilter } from './components/CategoryFilter';
import { LoadingIndicator } from './components/LoadingIndicator';
import { FileViewMode } from './types';
import { Separator } from '@/components/ui/separator';

export function Diretorio() {
  // Estado para o modo de visualização
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  
  // Hooks para operações de categoria e arquivo
  const categoryOps = useCategoryOperations();
  
  // Hooks para dados
  const { 
    categories, 
    isLoading: categoriesLoading, 
    addCategory, 
    updateCategory,
    deleteCategory 
  } = useDirectoryCategories();
  
  const { 
    files, 
    isLoading: filesLoading, 
    updateFile, 
    deleteFile
  } = useDirectoryFiles(categoryOps.selectedCategoryId);
  
  // Hook de operações de arquivos
  const fileOps = useFileOperations(files, categories);
  
  // Manipuladores de eventos para categorias
  const handleAddCategory = async (name: string, description: string) => {
    await addCategory(name, description || undefined);
  };

  const handleUpdateCategory = async (name: string, description: string) => {
    if (!categoryOps.selectedCategory) return;
    await updateCategory(categoryOps.selectedCategory.id, { name, description: description || undefined });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (categoryOps.selectedCategoryId === categoryId) {
      categoryOps.setSelectedCategoryId(undefined);
    }
    await deleteCategory(categoryId);
  };
  
  // Manipuladores de eventos para arquivos
  const handleUpdateFile = async (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => {
    if (!fileOps.selectedFile) return;
    await updateFile(fileOps.selectedFile.id, updates);
  };

  const handleDeleteFileConfirm = async () => {
    if (!fileOps.selectedFile) return;
    await deleteFile(fileOps.selectedFile.id, fileOps.selectedFile.file_url);
  };

  const isLoading = categoriesLoading || filesLoading;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Diretório de Arquivos</h2>
        <p className="text-muted-foreground text-sm">
          Organize e acesse documentos importantes para o setor
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Barra de ferramentas */}
        <DirectoryToolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={fileOps.sortBy}
          sortDirection={fileOps.sortDirection}
          handleSortChange={fileOps.handleSortChange}
          setCategoryDialogOpen={categoryOps.setCategoryDialogOpen}
          categories={categories}
          setSelectedCategoryId={categoryOps.setSelectedCategoryId}
          handleEditCategory={categoryOps.handleEditCategory}
          searchQuery={fileOps.searchQuery}
          setSearchQuery={fileOps.setSearchQuery}
        />

        {/* Filtro de categoria ativo */}
        <CategoryFilter 
          selectedCategoryId={categoryOps.selectedCategoryId}
          handleClearCategory={categoryOps.handleClearCategory}
          categories={categories}
        />

        <Separator />

        {/* Exibição de arquivos */}
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          viewMode === 'grid' ? (
            <FileGrid
              files={fileOps.sortedFiles}
              onViewFile={fileOps.handleViewFile}
              onDeleteFile={fileOps.handleDeleteFile}
              onEditFile={fileOps.handleEditFile}
            />
          ) : (
            <FileList
              files={fileOps.sortedFiles}
              onViewFile={fileOps.handleViewFile}
              onDeleteFile={fileOps.handleDeleteFile}
              onEditFile={fileOps.handleEditFile}
            />
          )
        )}
      </div>

      {/* Diálogos */}
      <CategoryDialog
        open={categoryOps.categoryDialogOpen}
        onOpenChange={categoryOps.setCategoryDialogOpen}
        onSave={handleAddCategory}
        title="Nova Categoria"
      />

      <CategoryDialog
        open={categoryOps.editCategoryDialogOpen}
        onOpenChange={categoryOps.setEditCategoryDialogOpen}
        onSave={handleUpdateCategory}
        category={categoryOps.selectedCategory || undefined}
        title="Editar Categoria"
      />

      {fileOps.selectedFile && (
        <FileDialog
          open={fileOps.fileDialogOpen}
          onOpenChange={fileOps.setFileDialogOpen}
          onSave={handleUpdateFile}
          file={fileOps.selectedFile}
          categories={categories}
        />
      )}

      <DeleteFileDialog
        open={fileOps.deleteDialogOpen}
        onOpenChange={fileOps.setDeleteDialogOpen}
        onDelete={handleDeleteFileConfirm}
        file={fileOps.selectedFile}
      />

      <FileViewer
        open={fileOps.viewerOpen}
        onOpenChange={fileOps.setViewerOpen}
        file={fileOps.selectedFile}
      />
    </div>
  );
}
