import { useMoveisDirectoryOperations } from './hooks/useMoveisDirectoryOperations';
import { FileUploadSection } from './components/FileUploadSection';
import { FileDisplaySection } from './components/FileDisplaySection';
import { DirectoryDialogs } from './components/DirectoryDialogs';
import { DirectoryHeader } from '@/components/crediario/diretorio/components/DirectoryHeader';

export function Diretorio() {
  const {
    // Estado
    viewMode,
    setViewMode,
    
    // Categorias
    categories,
    categoryOps,
    handleAddCategory,
    handleUpdateCategory,
    
    // Arquivos
    fileOps,
    handleUpdateFile,
    handleDeleteFileConfirm,
    handleFileUpload,
    isUploading,
    
    // Estado de carregamento
    isLoading
  } = useMoveisDirectoryOperations();

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <DirectoryHeader 
        sector="móveis"
        description="Organize e acesse documentos importantes para o setor de móveis"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seção de upload de arquivos */}
        <FileUploadSection
          isUploading={isUploading}
          onUpload={handleFileUpload}
          categories={categories}
        />
        
        {/* Seção de exibição de arquivos */}
        <FileDisplaySection
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
          selectedCategoryId={categoryOps.selectedCategoryId}
          handleClearCategory={categoryOps.handleClearCategory}
          isLoading={isLoading}
          sortedFiles={fileOps.sortedFiles}
          onViewFile={fileOps.handleViewFile}
          onDeleteFile={fileOps.handleDeleteFile}
          onEditFile={fileOps.handleEditFile}
        />
      </div>

      {/* Diálogos */}
      <DirectoryDialogs
        categoryDialogOpen={categoryOps.categoryDialogOpen}
        setCategoryDialogOpen={categoryOps.setCategoryDialogOpen}
        onAddCategory={handleAddCategory}
        
        editCategoryDialogOpen={categoryOps.editCategoryDialogOpen}
        setEditCategoryDialogOpen={categoryOps.setEditCategoryDialogOpen}
        onUpdateCategory={handleUpdateCategory}
        selectedCategory={categoryOps.selectedCategory}
        
        fileDialogOpen={fileOps.fileDialogOpen}
        setFileDialogOpen={fileOps.setFileDialogOpen}
        onUpdateFile={handleUpdateFile}
        
        deleteDialogOpen={fileOps.deleteDialogOpen}
        setDeleteDialogOpen={fileOps.setDeleteDialogOpen}
        onDeleteFile={handleDeleteFileConfirm}
        
        viewerOpen={fileOps.viewerOpen}
        setViewerOpen={fileOps.setViewerOpen}
        
        selectedFile={fileOps.selectedFile}
        categories={categories}
      />
    </div>
  );
}
