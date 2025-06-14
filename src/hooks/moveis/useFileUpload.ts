
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadOptions } from '@/types/attachments';
import { toast } from '@/hooks/use-toast';

// Enhanced security helper to sanitize filenames
const sanitizeFilename = (filename: string): string => {
  // Remove dangerous characters and limit length
  const name = filename.substring(0, filename.lastIndexOf('.')) || filename;
  const extension = filename.split('.').pop() || '';
  
  // Remove all non-alphanumeric characters except underscore, dash, and dot
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .substring(0, 100); // Limit filename length
  
  return extension ? `${sanitizedName}.${extension}` : sanitizedName;
};

// Security: Comprehensive file validation
const validateFile = (file: File, options: FileUploadOptions): { valid: boolean; error?: string } => {
  const maxSizeInMB = options.maxSizeInMB || 10;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Size validation
  if (file.size > maxSizeInBytes) {
    return { 
      valid: false, 
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB` 
    };
  }

  // Minimum size validation (prevent empty files)
  if (file.size < 1) {
    return { 
      valid: false, 
      error: "Arquivo está vazio" 
    };
  }

  // Enhanced MIME type validation with strict allowlist
  const allowedTypes = options.allowedFileTypes || [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/msword', // .doc
    'application/vnd.ms-excel' // .xls
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Tipo de arquivo não permitido: ${file.type}` 
    };
  }

  // Additional security: Check file extension matches MIME type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const mimeToExtension: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'application/pdf': ['pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/msword': ['doc'],
    'application/vnd.ms-excel': ['xls']
  };

  const allowedExtensions = mimeToExtension[file.type];
  if (allowedExtensions && fileExtension && !allowedExtensions.includes(fileExtension)) {
    return { 
      valid: false, 
      error: "Extensão do arquivo não corresponde ao tipo" 
    };
  }

  return { valid: true };
};

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, options: FileUploadOptions) => {
    try {
      setIsUploading(true);
      setProgress(10);
      
      if (!file) {
        toast({
          title: "Erro de Segurança",
          description: "Nenhum arquivo foi selecionado",
          variant: "destructive",
        });
        return null;
      }

      // Enhanced security validation
      const validation = validateFile(file, options);
      if (!validation.valid) {
        toast({
          title: "Arquivo Rejeitado",
          description: validation.error,
          variant: "destructive",
        });
        setProgress(0);
        return null;
      }

      setProgress(30);

      // Security: Generate cryptographically secure filename
      let filePath = options.folder ? `${options.folder}/` : '';
      const sanitizedName = sanitizeFilename(file.name);
      
      if (options.generateUniqueName) {
        const fileExt = sanitizedName.split('.').pop();
        const uniqueName = `${uuidv4()}.${fileExt}`;
        filePath += uniqueName;
      } else {
        // Add timestamp to prevent overwrites even when not generating unique names
        const timestamp = Date.now();
        const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'));
        const ext = sanitizedName.split('.').pop();
        filePath += `${nameWithoutExt}_${timestamp}.${ext}`;
      }
      
      setProgress(60);

      // Security: Upload with strict settings
      const { data, error } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Never overwrite existing files
          contentType: file.type // Ensure correct MIME type
        });

      if (error) {
        console.error("Upload error:", error);
        
        // Security: Don't expose internal error details
        let userMessage = "Erro no upload do arquivo";
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          userMessage = "Arquivo já existe. Tente renomear o arquivo.";
        } else if (error.message.includes('size')) {
          userMessage = "Arquivo muito grande para upload.";
        }
        
        toast({
          title: "Erro no Upload",
          description: userMessage,
          variant: "destructive",
        });
        setProgress(0);
        return null;
      }
      
      setProgress(90);

      // Get secure public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(data.path);
        
      setProgress(100);

      // Security: Log successful upload for audit
      console.log('File uploaded successfully', {
        filename: sanitizedName,
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString()
      });

      return {
        name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: Math.round(file.size / 1024), // Size in KB
      };
    } catch (err) {
      console.error("Unexpected upload error:", err);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setProgress(0);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadFile,
    progress,
  };
}
