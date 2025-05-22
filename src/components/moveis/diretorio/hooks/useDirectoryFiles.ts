
import { useState, useEffect } from 'react';
import { DirectoryFile } from '../types';
import { useSupabaseClient } from '@supabase/supabase-js';

export function useDirectoryFiles(tableName: string, categoryId?: string) {
  const supabaseClient = useSupabaseClient();
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Buscar arquivos
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      let query = supabaseClient
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      // Se uma categoria for especificada, filtrar por ela
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setFiles(data || []);
    } catch (err) {
      setError(err as Error);
      console.error(`Erro ao buscar arquivos: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar arquivo
  const addFile = async (fileData: Partial<DirectoryFile>) => {
    try {
      const { data, error } = await supabaseClient
        .from(tableName)
        .insert([fileData])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setFiles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error(`Erro ao adicionar arquivo: ${err}`);
      throw err;
    }
  };

  // Atualizar arquivo
  const updateFile = async (id: string, updates: Partial<DirectoryFile>) => {
    try {
      const { data, error } = await supabaseClient
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setFiles(prev => prev.map(file => file.id === id ? data : file));
      return data;
    } catch (err) {
      console.error(`Erro ao atualizar arquivo: ${err}`);
      throw err;
    }
  };

  // Excluir arquivo
  const deleteFile = async (id: string, fileUrl?: string) => {
    try {
      // Primeiro exclui da tabela
      const { error: dbError } = await supabaseClient
        .from(tableName)
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      // Se houver uma URL de arquivo, tenta remover o arquivo do storage
      if (fileUrl) {
        try {
          const path = fileUrl.split('/').slice(3).join('/');
          await supabaseClient.storage.from('moveis_arquivos').remove([path]);
        } catch (storageErr) {
          console.error("Erro ao remover arquivo do storage:", storageErr);
          // Não interrompe o processo se o arquivo não puder ser excluído
        }
      }

      setFiles(prev => prev.filter(file => file.id !== id));
    } catch (err) {
      console.error(`Erro ao excluir arquivo: ${err}`);
      throw err;
    }
  };

  // Efeito para buscar arquivos ao montar o componente ou quando a categoria mudar
  useEffect(() => {
    fetchFiles();
  }, [categoryId]);

  return {
    files,
    isLoading,
    error,
    addFile,
    updateFile,
    deleteFile,
    fetchFiles
  };
}
