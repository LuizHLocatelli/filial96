
import { useState } from 'react';
import { useModaDirectoryFiles } from './useModaDirectoryFiles';
import { useModaDirectoryCategories } from './useModaDirectoryCategories';
import { useModaCategoryOperations } from './useModaCategoryOperations';
import { useFileOperations } from './useFileOperations';
import { toast } from 'sonner';

export function useModaDirectoryOperations() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);

  // Usar hooks específicos do moda
  const { files, isLoading: isLoadingFiles, refetch: refetchFiles } = useModaDirectoryFiles();
  const { categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useModaDirectoryCategories();

  // Operações de categoria
  const categoryOps = useModaCategoryOperations(refetchCategories);

  // Operações de arquivo
  const fileOps = useFileOperations('moda_arquivos', files, refetchFiles);

  const isLoading = isLoadingFiles || isLoadingCategories;

  const handleAddCategory = async (nome: string, cor: string, descricao?: string) => {
    try {
      await categoryOps.handleAddCategory(nome, cor, descricao);
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (id: string, nome: string, cor: string, descricao?: string) => {
    try {
      await categoryOps.handleUpdateCategory(id, nome, cor, descricao);
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleFileUpload = async (files: FileList | File[], categoryId?: string) => {
    try {
      setIsUploading(true);
      await fileOps.handleFileUpload(files, categoryId);
      toast.success('Arquivo(s) enviado(s) com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo(s)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateFile = async (id: string, nome: string, descricao?: string, categoriaId?: string) => {
    try {
      await fileOps.handleUpdateFile(id, nome, descricao, categoriaId);
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
    isUploading,
    isLoading,

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
  };
}
