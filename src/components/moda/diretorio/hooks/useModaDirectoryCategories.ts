import { useState, useEffect } from 'react';
import { DirectoryCategory } from '@/components/crediario/diretorio/types';
import { supabase } from '@/integrations/supabase/client';

export function useModaDirectoryCategories() {
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Buscar categorias
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('moda_categorias')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data as DirectoryCategory[] || []);
    } catch (err) {
      setError(err as Error);
      console.error(`Erro ao buscar categorias: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar categoria
  const addCategory = async (name: string, color: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('moda_categorias')
        .insert([{ name, color, description }])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setCategories(prev => [...prev, data as DirectoryCategory]);
      return data as DirectoryCategory;
    } catch (err) {
      console.error(`Erro ao adicionar categoria: ${err}`);
      throw err;
    }
  };

  // Atualizar categoria
  const updateCategory = async (id: string, updates: Partial<DirectoryCategory>) => {
    try {
      const { data, error } = await supabase
        .from('moda_categorias')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setCategories(prev => prev.map(cat => cat.id === id ? (data as DirectoryCategory) : cat));
      return data as DirectoryCategory;
    } catch (err) {
      console.error(`Erro ao atualizar categoria: ${err}`);
      throw err;
    }
  };

  // Excluir categoria
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('moda_categorias')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error(`Erro ao excluir categoria: ${err}`);
      throw err;
    }
  };

  // Buscar categorias ao montar o componente
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
