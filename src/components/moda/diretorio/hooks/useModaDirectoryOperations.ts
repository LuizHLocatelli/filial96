import { useState } from 'react';
import { useModaDirectoryFiles } from './useModaDirectoryFiles';
import { useModaDirectoryCategories } from './useModaDirectoryCategories';
import { useModaCategoryOperations } from './useModaCategoryOperations';
import { useFileOperations } from './useFileOperations';
import { FileViewMode } from '@/components/crediario/diretorio/types';
import { toast } from 'sonner';

export function useModaDirectoryOperations() {
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  const [isUploading, setIsUploading] = useState(false);

  // Usar hooks específicos do moda
  const { files, isLoading: isLoadingFiles, refetch: refetchFiles } = useModaDirectoryFiles();
  const { categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useModaDirectoryCategories();

  // Operações de categoria
  const categoryOps = useModaCategoryOperations(refetchCategories);

  // Operações de arquivo
  const fileOps = useFileOperations('moda_arquivos', files, refetchFiles);

  const isLoading = isLoadingFiles || isLoadingCategories;

  const handleAddCategory = async (name: string, description: string) => {
    try {
      await categoryOps.handleAddCategory(name, 'primary', description);
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (name: string, description: string) => {
    try {
      if (!categoryOps.selectedCategory) return;
      await categoryOps.handleUpdateCategory(categoryOps.selectedCategory.id, name, 'primary', description);
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleFileUpload = async (file: File, categoryId: string | null, isFeatured: boolean) => {
    try {
      setIsUploading(true);
      await fileOps.handleFileUpload([file], categoryId || undefined);
      toast.success('Arquivo enviado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateFile = async (updates: {
    name: string;
    description: string;
    category_id: string | null;
    is_featured: boolean;
  }) => {
    try {
      if (!fileOps.selectedFile) return;
      await fileOps.handleUpdateFile(fileOps.selectedFile.id, updates.name, updates.description, updates.category_id || undefined);
      toast.success('Arquivo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar arquivo:', error);
      toast.error('Erro ao atualizar arquivo');
    }
  };

  const handleDeleteFileConfirm = async () => {
    try {
      await fileOps.handleDeleteFileConfirm();
      toast.success('Arquivo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error('Erro ao excluir arquivo');
    }
  };

  return {
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
  };
}
