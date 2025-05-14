
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryFile } from '../types';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/crediario/useFileUpload';

export function useDirectoryFiles(categoryId?: string) {
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { uploadFile, isUploading, progress } = useFileUpload();
  
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('crediario_directory_files')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setFiles(data || []);
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar arquivos'));
      toast.error('Erro ao carregar arquivos do diretório');
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadDirectoryFile = async (file: File, options: { 
    name?: string; 
    description?: string; 
    categoryId?: string; 
    isFeatured?: boolean;
  }) => {
    if (!file) return null;
    
    try {
      // Usar o hook useFileUpload para garantir consistência
      const fileUrl = await uploadFile(file, {
        bucketName: 'directory_files',
        folder: 'files'
      });
      
      if (!fileUrl) {
        throw new Error('Falha ao fazer upload do arquivo');
      }
      
      // Salvar metadados do arquivo no banco de dados
      const fileData = {
        name: options.name || file.name,
        description: options.description || null,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        category_id: options.categoryId || null,
        is_featured: options.isFeatured || false
      };
      
      const { data, error } = await supabase
        .from('crediario_directory_files')
        .insert([fileData])
        .select()
        .single();
      
      if (error) throw error;
      
      setFiles(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Erro ao fazer upload do arquivo:', err);
      // Não exibe toast aqui pois já foi exibido na função uploadFile
      throw err;
    }
  };
  
  const updateFile = async (id: string, updates: {
    name?: string;
    description?: string;
    category_id?: string | null;
    is_featured?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('crediario_directory_files')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setFiles(prev => prev.map(file => file.id === id ? data : file));
      toast.success('Arquivo atualizado com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao atualizar arquivo:', err);
      toast.error('Não foi possível atualizar o arquivo');
      throw err;
    }
  };
  
  const deleteFile = async (id: string, fileUrl: string) => {
    try {
      // Extrair o caminho do arquivo a partir da URL
      const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/directory_files\/(.+)$/);
      
      if (filePathMatch && filePathMatch[1]) {
        const filePath = decodeURIComponent(filePathMatch[1]);
        
        // Excluir o arquivo do storage
        const { error: storageError } = await supabase.storage
          .from('directory_files')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Erro ao excluir arquivo do storage:', storageError);
        }
      }
      
      // Excluir o registro do banco de dados
      const { error } = await supabase
        .from('crediario_directory_files')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setFiles(prev => prev.filter(file => file.id !== id));
      toast.success('Arquivo excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir arquivo:', err);
      toast.error('Não foi possível excluir o arquivo');
      throw err;
    }
  };
  
  useEffect(() => {
    fetchFiles();
  }, [categoryId]);
  
  return {
    files,
    isLoading,
    isUploading,
    progress,
    error,
    fetchFiles,
    uploadFile: uploadDirectoryFile,
    updateFile,
    deleteFile
  };
}
