
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DirectoryFile } from '../types';

export function useDirectoryFiles(categoryId?: string, tableName = 'crediario_directory_files') {
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [categoryId, tableName]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      let query;
      
      // Using hardcoded table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos');
      } else {
        query = supabase.from('crediario_directory_files');
      }
      
      // Apply filters and ordering
      query = query.order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Use type assertion to properly convert data
      setFiles((data || []) as unknown as DirectoryFile[]);
    } catch (error: any) {
      console.error('Erro ao buscar arquivos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de arquivos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFile = async (fileData: Partial<DirectoryFile>) => {
    try {
      // Convert "none" to null for category_id
      if (fileData.category_id === "none") {
        fileData.category_id = null;
      }
      
      let query;
      
      // Using hardcoded table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos');
      } else {
        query = supabase.from('crediario_directory_files');
      }
      
      const { error } = await query.insert(fileData);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Arquivo adicionado com sucesso.',
      });

      fetchFiles();
    } catch (error: any) {
      console.error('Erro ao adicionar arquivo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao adicionar o arquivo.',
        variant: 'destructive',
      });
    }
  };

  const updateFile = async (
    id: string,
    updates: {
      name: string;
      description: string;
      category_id: string | null;
      is_featured: boolean;
    }
  ) => {
    try {
      // Convert "none" to null for category_id
      if (updates.category_id === "none") {
        updates.category_id = null;
      }
      
      let query;
      
      // Using hardcoded table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos');
      } else {
        query = supabase.from('crediario_directory_files');
      }
      
      const { error } = await query.update({
        name: updates.name,
        description: updates.description,
        category_id: updates.category_id,
        is_featured: updates.is_featured,
        updated_at: new Date().toISOString(),
      }).eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Arquivo atualizado com sucesso.',
      });

      fetchFiles();
    } catch (error: any) {
      console.error('Erro ao atualizar arquivo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao atualizar o arquivo.',
        variant: 'destructive',
      });
    }
  };

  const deleteFile = async (id: string, fileUrl: string) => {
    try {
      let query;
      
      // Using hardcoded table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos');
      } else {
        query = supabase.from('crediario_directory_files');
      }
      
      const { error } = await query.delete().eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Arquivo excluído com sucesso.',
      });

      fetchFiles();
    } catch (error: any) {
      console.error('Erro ao excluir arquivo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao excluir o arquivo.',
        variant: 'destructive',
      });
    }
  };

  return {
    files,
    isLoading,
    fetchFiles,
    addFile,
    updateFile,
    deleteFile,
  };
}
