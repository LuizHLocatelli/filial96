
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { DirectoryFile } from '../types';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const uploadFile = async (
    file: File, 
    categoryId: string | null, 
    isFeatured: boolean
  ): Promise<DirectoryFile | null> => {
    try {
      setIsUploading(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `files/${fileName}`;
      
      // Upload file to Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('directory_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (storageError) {
        console.error('Erro ao fazer upload do arquivo:', storageError);
        throw storageError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('directory_files')
        .getPublicUrl(filePath);
        
      if (!urlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do arquivo');
      }
      
      // Insert file record in database
      const { data: fileData, error: fileError } = await supabase
        .from('crediario_directory_files')
        .insert({
          name: file.name,
          description: '',
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          category_id: categoryId === 'none' ? null : categoryId,
          is_featured: isFeatured,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select('*')
        .single();
        
      if (fileError) {
        console.error('Erro ao salvar registro do arquivo:', fileError);
        throw fileError;
      }
      
      toast({
        title: 'Upload concluído',
        description: 'Arquivo adicionado com sucesso ao diretório.',
      });
      
      return fileData;
    } catch (error) {
      console.error('Erro detalhado ao adicionar arquivo:', error);
      const errorMsg = error instanceof Error ? error.message : 'Ocorreu um erro ao adicionar o arquivo.';
      
      toast({
        title: 'Erro ao fazer upload',
        description: errorMsg,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    uploadFile
  };
}
