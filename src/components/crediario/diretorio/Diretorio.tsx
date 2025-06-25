import { useDirectoryOperations } from './hooks/useDirectoryOperations';
import { FileUploader } from './components/FileUploader';
import { DirectoryHeader } from './components/DirectoryHeader';
import { DirectoryContent } from './components/DirectoryContent';
import { DirectoryDialogs } from './components/DirectoryDialogs';

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
  } = useDirectoryOperations();

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <DirectoryHeader 
        sector="crediário"
        description="Organize e acesse documentos importantes para o setor de crediário"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seção de upload de arquivos */}
        <div className="md:col-span-1">
          <FileUploader 
            isUploading={isUploading}
            onUpload={handleFileUpload}
            categories={categories}
          />
        </div>
        
        {/* Seção de exibição de arquivos */}
        <DirectoryContent
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
