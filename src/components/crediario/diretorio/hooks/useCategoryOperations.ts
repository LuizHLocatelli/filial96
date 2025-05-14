
import { useState } from 'react';
import { DirectoryCategory } from '../types';

export function useCategoryOperations() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | null>(null);

  const handleClearCategory = () => {
    setSelectedCategoryId(undefined);
  };

  const handleEditCategory = (category: DirectoryCategory) => {
    setSelectedCategory(category);
    setEditCategoryDialogOpen(true);
  };

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    categoryDialogOpen,
    setCategoryDialogOpen,
    editCategoryDialogOpen,
    setEditCategoryDialogOpen,
    selectedCategory,
    setSelectedCategory,
    handleClearCategory,
    handleEditCategory
  };
}
