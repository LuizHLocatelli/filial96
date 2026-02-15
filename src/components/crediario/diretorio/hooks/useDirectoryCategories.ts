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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_directory_categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      const typedData = (data || []) as unknown as DirectoryCategory[];
      setCategories(typedData);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
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
      const { error } = await supabase
        .from('crediario_directory_categories')
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
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      const errorMsg = err instanceof Error ? err.message : 'Ocorreu um erro ao criar a categoria.';
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const updateCategory = async (
    id: string,
    updates: { name: string; description?: string }
  ) => {
    try {
      const { error } = await supabase
        .from('crediario_directory_categories')
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
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      const errorMsg = err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a categoria.';
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // First, update the files of this category to have no category
      await supabase
        .from('crediario_directory_files')
        .update({ category_id: null })
        .eq('category_id', id);

      // Now remove the category
      const { error } = await supabase
        .from('crediario_directory_categories')
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
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      const errorMsg = err instanceof Error ? err.message : 'Ocorreu um erro ao excluir a categoria.';
      toast({
        title: 'Erro',
        description: errorMsg,
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
