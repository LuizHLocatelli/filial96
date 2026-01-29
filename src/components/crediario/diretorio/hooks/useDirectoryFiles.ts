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
      let query = supabase
        .from('crediario_directory_files')
        .select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const typedData = (data || []) as unknown as DirectoryFile[];
      setFiles(typedData);
    } catch (error: any) {
      console.error('Erro ao buscar arquivos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os arquivos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFile = async (file: {
    name: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size?: number;
    category_id?: string;
    is_featured?: boolean;
  }) => {
    try {
      const { error } = await supabase
        .from('crediario_directory_files')
        .insert({
          name: file.name,
          description: file.description,
          file_url: file.file_url,
          file_type: file.file_type,
          file_size: file.file_size,
          category_id: file.category_id,
          is_featured: file.is_featured || false,
        });

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
      name?: string;
      description?: string;
      category_id?: string | null;
      is_featured?: boolean;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('crediario_directory_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

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

  const deleteFile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crediario_directory_files')
        .delete()
        .eq('id', id);

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
