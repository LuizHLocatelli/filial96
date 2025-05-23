
import { useState } from 'react';
import { useDirectoryCategories } from './useDirectoryCategories';
import { useDirectoryFiles } from './useDirectoryFiles';
import { useCategoryOperations } from './useCategoryOperations';
import { useFileOperations } from './useFileOperations';
import { useFileUpload } from './useFileUpload';

export function useDirectoryOperations() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Category operations
  const categoryOps = useCategoryOperations();
  
  // Data hooks
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
    fetchFiles
  } = useDirectoryFiles(categoryOps.selectedCategoryId);

  const { isUploading, uploadFile } = useFileUpload();
  
  // File operations hook
  const fileOps = useFileOperations(files, categories);
  
  // Event handlers for categories
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
  
  // Event handlers for files
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
    const result = await uploadFile(file, categoryId, isFeatured);
    if (result) {
      await fetchFiles();
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
