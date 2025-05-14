
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AttachmentUploadResult } from "@/types/attachments";

interface FileUploadOptions {
  bucketName: string;
  folder?: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, options: FileUploadOptions): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Validate file size (limit to 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error(`O arquivo é muito grande. O limite é de 100MB.`);
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = options.folder 
        ? `${options.folder}/${fileName}`
        : fileName;
      
      console.log(`Iniciando upload para ${options.bucketName}/${filePath}`);
      
      // Upload file to Supabase Storage with progress tracking
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percent);
            console.log(`Progresso do upload: ${percent}%`);
          }
        });
      
      if (uploadError) {
        console.error("Erro de upload:", uploadError);
        
        if (uploadError.message?.includes('JWT')) {
          toast.error("Erro de autenticação. Por favor, faça login novamente.");
        } else if (uploadError.message?.includes('size')) {
          toast.error("O arquivo é muito grande ou o formato não é permitido.");
        } else {
          toast.error("Não foi possível enviar o arquivo. Tente novamente mais tarde.");
        }
        
        throw uploadError;
      }
      
      console.log(`Arquivo enviado com sucesso: ${filePath}`);
      
      // Get public URL of the file
      const { data: urlData } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(filePath);
      
      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error("Erro ao enviar arquivo:", error);
      
      if (!toast.message) { // Check if toast isn't already displayed
        if (error.message?.includes('bucket') || error.status === 404) {
          toast.error("O bucket de armazenamento não existe ou você não tem permissão.");
        } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
          toast.error("Erro de autenticação. Por favor, faça login novamente.");
        } else {
          toast.error("Ocorreu um erro ao enviar o arquivo.");
        }
      }
      
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress
  };
}
