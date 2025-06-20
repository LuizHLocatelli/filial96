
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
      console.log('Fetching files from table:', tableName, 'with categoryId:', categoryId);
      
      let query;
      
      // Using explicit table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos').select('*');
      } else {
        query = supabase.from('crediario_directory_files').select('*');
      }
      
      // Apply category filter if provided
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      // Apply ordering
      query = query.order('created_at', { ascending: false });

      console.log('Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Files fetched successfully:', data?.length || 0);
      
      // Convert data to DirectoryFile format with safety check
      const convertedFiles: DirectoryFile[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        file_url: item.file_url || '',
        file_type: item.file_type || '',
        file_size: item.file_size || null,
        category_id: item.category_id || null,
        is_featured: item.is_featured || false,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        created_by: item.created_by || null
      }));
      
      setFiles(convertedFiles);
    } catch (error: any) {
      console.error('Erro ao buscar arquivos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de arquivos.',
        variant: 'destructive',
      });
      setFiles([]); // Garantir que sempre seja um array
    } finally {
      setIsLoading(false);
    }
  };

  const addFile = async (fileData: Partial<DirectoryFile>) => {
    try {
      console.log('Adding file:', fileData);
      
      // Convert "none" to null for category_id
      if (fileData.category_id === "none") {
        fileData.category_id = null;
      }
      
      let query;
      
      // Using explicit table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos');
      } else {
        query = supabase.from('crediario_directory_files');
      }
      
      const { error } = await query.insert([fileData]);

      if (error) {
        console.error('Error adding file:', error);
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
      console.log('Updating file:', id, updates);
      
      // Convert "none" to null for category_id
      if (updates.category_id === "none") {
        updates.category_id = null;
      }
      
      let query;
      
      // Using explicit table names to avoid Supabase client type errors
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
        console.error('Error updating file:', error);
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
      console.log('Deleting file:', id);
      
      let query;
      
      // Using explicit table names to avoid Supabase client type errors
      if (tableName === 'moveis_arquivos') {
        query = supabase.from('moveis_arquivos');
      } else {
        query = supabase.from('crediario_directory_files');
      }
      
      const { error } = await query.delete().eq('id', id);

      if (error) {
        console.error('Error deleting file:', error);
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
