import { useEffect } from 'react';
import { useModaDirectoryOperations } from './hooks/useModaDirectoryOperations';
import { FileUploadSection } from './components/FileUploadSection';
import { FileDisplaySection } from './components/FileDisplaySection';
import { DirectoryDialogs } from './components/DirectoryDialogs';
import { Separator } from '@/components/ui/separator';
import { useModaTracking } from '@/hooks/useModaTracking';

export function Diretorio() {
  const { trackDiretorioEvent } = useModaTracking();
  
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
  } = useModaDirectoryOperations();

  useEffect(() => {
    // Registrar acesso à seção de diretório
    trackDiretorioEvent('acesso_diretorio');
  }, [trackDiretorioEvent]);

  // Wrapper functions para rastrear ações
  const handleTrackedFileUpload = async (files: FileList, categoryId?: string) => {
    trackDiretorioEvent('upload_iniciado', { 
      quantidade_arquivos: files.length,
      categoria_id: categoryId 
    });
    
    try {
      await handleFileUpload(files, categoryId);
      trackDiretorioEvent('upload_concluido', { 
        quantidade_arquivos: files.length,
        categoria_id: categoryId 
      });
    } catch (error) {
      trackDiretorioEvent('upload_erro', { 
        quantidade_arquivos: files.length,
        categoria_id: categoryId,
        erro: error 
      });
    }
  };

  const handleTrackedViewFile = (file: any) => {
    trackDiretorioEvent('arquivo_visualizado', file);
    fileOps.handleViewFile(file);
  };

  const handleTrackedDeleteFile = (file: any) => {
    trackDiretorioEvent('arquivo_deletado', file);
    fileOps.handleDeleteFile(file);
  };

  const handleTrackedEditFile = (file: any) => {
    trackDiretorioEvent('arquivo_editado', file);
    fileOps.handleEditFile(file);
  };

  const handleTrackedAddCategory = (categoryData: any) => {
    trackDiretorioEvent('categoria_criada', categoryData);
    handleAddCategory(categoryData);
  };

  const handleTrackedUpdateCategory = (categoryData: any) => {
    trackDiretorioEvent('categoria_atualizada', categoryData);
    handleUpdateCategory(categoryData);
  };

  const handleTrackedSortChange = (field: string) => {
    trackDiretorioEvent('ordenacao_alterada', { campo: field });
    fileOps.handleSortChange(field);
  };

  const handleTrackedSearchChange = (query: string) => {
    if (query.length > 2) { // Só rastreia buscas com mais de 2 caracteres
      trackDiretorioEvent('busca_realizada', { termo_busca: query });
    }
    fileOps.setSearchQuery(query);
  };

  const handleTrackedViewModeChange = (mode: string) => {
    trackDiretorioEvent('modo_visualizacao_alterado', { modo: mode });
    setViewMode(mode);
  };

  const handleTrackedCategoryFilter = (categoryId: string) => {
    trackDiretorioEvent('filtro_categoria_aplicado', { categoria_id: categoryId });
    categoryOps.setSelectedCategoryId(categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Diretório de Arquivos</h2>
        <p className="text-muted-foreground text-sm">
          Organize e acesse documentos importantes para o setor de moda
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seção de upload de arquivos */}
        <FileUploadSection
          isUploading={isUploading}
          onUpload={handleTrackedFileUpload}
          categories={categories}
        />
        
        {/* Seção de exibição de arquivos */}
        <FileDisplaySection
          viewMode={viewMode}
          setViewMode={handleTrackedViewModeChange}
          sortBy={fileOps.sortBy}
          sortDirection={fileOps.sortDirection}
          handleSortChange={handleTrackedSortChange}
          setCategoryDialogOpen={categoryOps.setCategoryDialogOpen}
          categories={categories}
          setSelectedCategoryId={handleTrackedCategoryFilter}
          handleEditCategory={categoryOps.handleEditCategory}
          searchQuery={fileOps.searchQuery}
          setSearchQuery={handleTrackedSearchChange}
          selectedCategoryId={categoryOps.selectedCategoryId}
          handleClearCategory={categoryOps.handleClearCategory}
          isLoading={isLoading}
          sortedFiles={fileOps.sortedFiles}
          onViewFile={handleTrackedViewFile}
          onDeleteFile={handleTrackedDeleteFile}
          onEditFile={handleTrackedEditFile}
        />
      </div>

      {/* Diálogos */}
      <DirectoryDialogs
        categoryDialogOpen={categoryOps.categoryDialogOpen}
        setCategoryDialogOpen={categoryOps.setCategoryDialogOpen}
        onAddCategory={handleTrackedAddCategory}
        
        editCategoryDialogOpen={categoryOps.editCategoryDialogOpen}
        setEditCategoryDialogOpen={categoryOps.setEditCategoryDialogOpen}
        onUpdateCategory={handleTrackedUpdateCategory}
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