
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AttachmentUploadResult, FileUploadOptions } from "@/types/attachments";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, options: FileUploadOptions): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Validate file size
      const maxSize = (options.maxSizeInMB || 100) * 1024 * 1024; // Default to 100MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo é muito grande. O limite é de ${options.maxSizeInMB || 100}MB.`,
          variant: "destructive"
        });
        return null;
      }

      // Generate filename
      let fileName = file.name;
      if (options.generateUniqueName !== false) {
        const fileExt = file.name.split('.').pop();
        fileName = `${uuidv4()}.${fileExt}`;
      }
      
      const filePath = options.folder 
        ? `${options.folder}/${fileName}`
        : fileName;
      
      console.log(`Iniciando upload para ${options.bucketName}/${filePath}`);
      
      // Create a custom progress tracker
      let lastProgress = 0;
      const progressInterval = setInterval(() => {
        // Simulate progress update (since we can't track real progress)
        if (lastProgress < 95) {
          lastProgress += Math.random() * 10;
          const rounded = Math.min(95, Math.round(lastProgress));
          setProgress(rounded);
          console.log(`Progresso do upload: ${rounded}%`);
        }
      }, 300);
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      // Clear interval and set to 100% when done
      clearInterval(progressInterval);
      setProgress(100);
      
      if (uploadError) {
        console.error("Erro de upload:", uploadError);
        
        if (uploadError.message?.includes('JWT')) {
          toast({
            title: "Erro de autenticação",
            description: "Por favor, faça login novamente.",
            variant: "destructive"
          });
        } else if (uploadError.message?.includes('size')) {
          toast({
            title: "Arquivo muito grande",
            description: "O arquivo é muito grande ou o formato não é permitido.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro de upload",
            description: "Não foi possível enviar o arquivo. Tente novamente mais tarde.",
            variant: "destructive"
          });
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
      
      toast({
        title: "Erro de upload", 
        description: error.message || "Ocorreu um erro ao enviar o arquivo.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500); // Reset progress after a short delay
    }
  };

  return {
    uploadFile,
    isUploading,
    progress
  };
}
