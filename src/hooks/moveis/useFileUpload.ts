
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadOptions } from '@/types/attachments';
import { toast } from '@/hooks/use-toast';

// Helper to sanitize filenames to prevent security issues like path traversal.
const sanitizeFilename = (filename: string): string => {
  // This removes most special characters, replacing them with an underscore, but preserves the file extension.
  const name = filename.substring(0, filename.lastIndexOf('.')) || filename;
  const extension = filename.split('.').pop() || '';
  const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return extension ? `${sanitizedName}.${extension}` : sanitizedName;
};

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, options: FileUploadOptions) => {
    try {
      setIsUploading(true);
      
      if (!file) {
        toast({
          title: "Erro",
          description: "Nenhum arquivo selecionado",
          variant: "destructive",
        });
        return null;
      }
      
      const maxSizeInMB = options.maxSizeInMB || 10; // Default to 10MB
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "Erro",
          description: `O arquivo excede o tamanho máximo de ${maxSizeInMB}MB`,
          variant: "destructive",
        });
        return null;
      }

      // Secure allowlist for file types
      const allowedTypes = options.allowedFileTypes || [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/msword', // .doc
        'application/vnd.ms-excel' // .xls
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: `Arquivos do tipo "${file.type}" não são aceitos.`,
          variant: "destructive",
        });
        return null;
      }

      let filePath = options.folder ? `${options.folder}/` : '';
      
      const sanitized = sanitizeFilename(file.name);
      
      if (options.generateUniqueName) {
        const fileExt = sanitized.split('.').pop();
        const uniqueName = `${uuidv4()}.${fileExt}`;
        filePath += uniqueName;
      } else {
        filePath += sanitized;
      }

      const { data, error } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Set to false to prevent overwriting files
        });

      if (error) {
        console.error("Erro ao fazer upload:", error);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(data.path);

      return {
        name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: Math.round(file.size / 1024), // Tamanho em KB
      };
    } catch (err) {
      console.error("Erro inesperado no upload:", err);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao fazer o upload do arquivo",
        variant: "destructive",
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
