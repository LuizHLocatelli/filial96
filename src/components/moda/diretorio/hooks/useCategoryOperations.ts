import { useState } from 'react';
import { DirectoryCategory } from '../types';
import { supabase } from '@/integrations/supabase/client';

export function useCategoryOperations(tableName: string, refetch: () => void) {
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

  // Adicionar categoria
  const handleAddCategory = async (name: string, color: string, description?: string) => {
    const { data, error } = await supabase
      .from(tableName)
      .insert([{ name, color, description }])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    refetch();
    return data as DirectoryCategory;
  };

  // Atualizar categoria
  const handleUpdateCategory = async (id: string, name: string, color: string, description?: string) => {
    const { data, error } = await supabase
      .from(tableName)
      .update({ name, color, description })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    refetch();
    return data as DirectoryCategory;
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
    handleClearCategory,
    handleAddCategory,
    handleUpdateCategory
  };
} 