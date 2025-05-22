import { useState } from 'react';
import { useDirectoryCategories } from './useDirectoryCategories';
import { useDirectoryFiles } from './useDirectoryFiles';
import { useCategoryOperations } from './useCategoryOperations';
import { useFileOperations } from './useFileOperations';
import { useFileUpload } from '@/hooks/moveis/useFileUpload';
import { FileViewMode } from '../types';

export function useMoveisDirectoryOperations() {
  // Estado para o modo de visualização
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  
  // Hooks para operações de categoria e arquivo
  const categoryOps = useCategoryOperations();
  
  // Hooks para dados - usamos tabelas específicas
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
    deleteFile,
    fetchFiles,
    addFile,
  } = useDirectoryFiles(categoryOps.selectedCategoryId);

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
      generateUniqueName: true,
      maxSizeInMB: 10 // Permitir arquivos maiores para documentos e PDFs
    });
    
    if (result) {
      await addFile({
        ...result,
        category_id: categoryId,
        is_featured: isFeatured,
        description: ""
      });
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
