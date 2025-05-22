
import { useState } from 'react';
import { useDirectoryCategories } from '@/components/crediario/diretorio/hooks/useDirectoryCategories';
import { useDirectoryFiles } from '@/components/crediario/diretorio/hooks/useDirectoryFiles';
import { useCategoryOperations } from '@/components/crediario/diretorio/hooks/useCategoryOperations';
import { useFileOperations } from '@/components/crediario/diretorio/hooks/useFileOperations';
import { useFileUpload } from '@/hooks/crediario/useFileUpload';
import { FileViewMode } from '@/components/crediario/diretorio/types';

export function useMoveisDirectoryOperations() {
  // Estado para o modo de visualização
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  
  // Hooks para operações de categoria e arquivo
  const categoryOps = useCategoryOperations();
  
  // Hooks para dados - usamos 'moveis_categorias' e 'moveis_arquivos' como tabelas
  const { 
    categories, 
    isLoading: categoriesLoading, 
    addCategory, 
    updateCategory,
    deleteCategory 
  } = useDirectoryCategories('moveis_categorias');
  
  const { 
    files, 
    isLoading: filesLoading, 
    updateFile, 
    deleteFile,
    fetchFiles,
    addFile,
  } = useDirectoryFiles('moveis_arquivos', categoryOps.selectedCategoryId);

  const { isUploading, uploadFile } = useFileUpload();
  
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

  const handleFileUpload = async (file: File, categoryId: string | null, isFeatured: boolean) => {
    const result = await uploadFile(file, {
      bucketName: "moveis_arquivos",
      folder: "diretorio",
      generateUniqueName: true
    });
    
    if (result) {
      const fileData = {
        ...result, 
        category_id: categoryId,
        is_featured: isFeatured
      };

      await addFile(fileData);
      return true;
    }
    return false;
  };

  const isLoading = categoriesLoading || filesLoading;

  return {
    // Estado
    viewMode,
    setViewMode,
    
    // Categorias
    categories,
    categoryOps,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    
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
