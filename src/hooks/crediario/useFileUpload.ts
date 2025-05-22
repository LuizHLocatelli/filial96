
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  bucketName?: string;
  folder?: string;
  generateUniqueName?: boolean;
}

export interface UploadedFile {
  name: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category_id: any;
  is_featured: boolean;
  created_by: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Add progress state
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
      
      // Set default options
      const bucketName = options.bucketName || "directory_files";
      const folder = options.folder || "files";
      const generateUniqueName = options.generateUniqueName !== false;
      
      // Generate unique filename if required
      let fileName = file.name;
      if (generateUniqueName) {
        const fileExt = file.name.split('.').pop();
        fileName = `${uuidv4()}.${fileExt}`;
      }
      
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      // Upload file to Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            // Update progress as a percentage
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percentage);
          }
        });
        
      if (storageError) {
        console.error('Erro ao fazer upload do arquivo:', storageError);
        throw storageError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      if (!urlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do arquivo');
      }
      
      toast({
        title: 'Upload concluído',
        description: 'Arquivo adicionado com sucesso.',
      });
      
      setProgress(100);
      
      return {
        name: file.name,
        description: '',
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        category_id: null,
        is_featured: false,
        created_by: (await supabase.auth.getUser()).data.user?.id || ''
      };
    } catch (error: any) {
      console.error('Erro detalhado ao adicionar arquivo:', error);
      
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Ocorreu um erro ao adicionar o arquivo.',
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
