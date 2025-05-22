
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DirectoryFile } from '../types';

export function useDirectoryFiles(tableName = 'crediario_directory_files', categoryId?: string) {
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [categoryId, tableName]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // Use type casting for the table name to bypass TypeScript's strict checking
      let query = supabase
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setFiles(data as DirectoryFile[]);
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

  const addFile = async (fileData: {
    name: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size?: number;
    category_id?: string | null;
    is_featured?: boolean;
  }) => {
    try {
      // Use type casting for the table name to bypass TypeScript's strict checking
      const { error } = await supabase.from(tableName as any).insert(fileData);

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
      // Use type casting for the table name to bypass TypeScript's strict checking
      const { error } = await supabase
        .from(tableName as any)
        .update({
          name: updates.name,
          description: updates.description,
          category_id: updates.category_id,
          is_featured: updates.is_featured,
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

  const deleteFile = async (id: string, fileUrl: string) => {
    try {
      // Use type casting for the table name to bypass TypeScript's strict checking
      // Deletar o registro do banco de dados
      const { error } = await supabase.from(tableName as any).delete().eq('id', id);

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
