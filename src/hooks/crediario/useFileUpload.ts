
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  bucketName?: string;
  folder?: string;
  generateUniqueName?: boolean;
  maxSizeInMB?: number;
}

export interface UploadedFile {
  name: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category_id: string | null;
  is_featured: boolean;
  created_by: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const uploadFile = async (
    file: File,
    options: UploadOptions = { 
      bucketName: "directory_files", 
      folder: "files", 
      generateUniqueName: true 
    }
  ): Promise<UploadedFile | null> => {
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Log progress for debugging
      console.log('Starting file upload with options:', options);
      
      // Set default options
      const bucketName = options.bucketName || "directory_files";
      const folder = options.folder || "files";
      const generateUniqueName = options.generateUniqueName !== false;
      const maxSizeInMB = options.maxSizeInMB || 5;
      
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`);
      }
      
      // Generate unique filename if required
      let fileName = file.name;
      if (generateUniqueName) {
        const fileExt = file.name.split('.').pop();
        fileName = `${uuidv4()}.${fileExt}`;
      }
      
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      console.log(`Uploading to bucket: ${bucketName}, path: ${filePath}`);
      
      // Upload file to Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
        
      if (storageError) {
        console.error('Erro ao fazer upload do arquivo:', storageError);
        throw storageError;
      }
      
      console.log('File uploaded successfully, getting public URL');
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      if (!urlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do arquivo');
      }
      
      console.log('Public URL obtained:', urlData.publicUrl);
      
      setProgress(100);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '';

      return {
        name: file.name,
        description: '',
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        category_id: null,
        is_featured: false,
        created_by: userId
      };
    } catch (error) {
      console.error('Erro detalhado ao adicionar arquivo:', error);
      
      const message = error instanceof Error ? error.message : 'Ocorreu um erro ao adicionar o arquivo.';
      
      toast({
        title: 'Erro ao fazer upload',
        description: message,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    progress,
    uploadFile
  };
}
