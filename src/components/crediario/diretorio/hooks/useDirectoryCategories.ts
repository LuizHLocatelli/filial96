
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DirectoryCategory } from '../types';

export function useDirectoryCategories(tableName = 'crediario_directory_categories') {
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, [tableName]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Use type casting for the table name to bypass TypeScript's strict checking
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data as DirectoryCategory[]);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (name: string, description?: string) => {
    try {
      // Use type casting for the table name to bypass TypeScript's strict checking
      const { error } = await supabase
        .from(tableName as any)
        .insert({
          name,
          description,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso.',
      });

      fetchCategories();
    } catch (error: any) {
      console.error('Erro ao adicionar categoria:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao criar a categoria.',
        variant: 'destructive',
      });
    }
  };

  const updateCategory = async (
    id: string,
    updates: { name: string; description?: string }
  ) => {
    try {
      // Use type casting for the table name to bypass TypeScript's strict checking
      const { error } = await supabase
        .from(tableName as any)
        .update({
          name: updates.name,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso.',
      });

      fetchCategories();
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao atualizar a categoria.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Dynamic table name for files table based on the categories table
      const filesTable = tableName === 'moveis_categorias' ? 'moveis_arquivos' : 'crediario_directory_files';
      
      // Use type casting for the table name to bypass TypeScript's strict checking
      // First, update the files of this category to have no category
      await supabase
        .from(filesTable as any)
        .update({ category_id: null })
        .eq('category_id', id);

      // Now remove the category
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso.',
      });

      fetchCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao excluir a categoria.',
        variant: 'destructive',
      });
    }
  };

  return {
    categories,
    isLoading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
