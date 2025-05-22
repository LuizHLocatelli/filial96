
import { useState } from 'react';
import { DirectoryCategory } from '../types';

export function useCategoryOperations() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | null>(null);
  
  // Estados para diálogos
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);

  // Manipuladores de eventos
  const handleEditCategory = (category: DirectoryCategory) => {
    setSelectedCategory(category);
    setEditCategoryDialogOpen(true);
  };

  const handleClearCategory = () => {
    setSelectedCategoryId(undefined);
  };

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCategory,
    setSelectedCategory,
    categoryDialogOpen,
    setCategoryDialogOpen,
    editCategoryDialogOpen,
    setEditCategoryDialogOpen,
    handleEditCategory,
    handleClearCategory
  };
}
