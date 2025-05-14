
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryCategory } from '../types';
import { toast } from 'sonner';

export function useDirectoryCategories() {
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('crediario_directory_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar categorias'));
      toast.error('Erro ao carregar categorias do diretório');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addCategory = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('crediario_directory_categories')
        .insert([{ 
          name, 
          description,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      toast.success('Categoria criada com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      toast.error('Não foi possível adicionar a categoria');
      throw err;
    }
  };
  
  const updateCategory = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      const { data, error } = await supabase
        .from('crediario_directory_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast.success('Categoria atualizada com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      toast.error('Não foi possível atualizar a categoria');
      throw err;
    }
  };
  
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crediario_directory_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria excluída com sucesso');
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      toast.error('Não foi possível excluir a categoria');
      throw err;
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
