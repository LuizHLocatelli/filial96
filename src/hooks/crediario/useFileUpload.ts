
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadOptions {
  bucketName: string;
  folder?: string;
}

export function useFileUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, options: FileUploadOptions): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = options.folder 
        ? `${options.folder}/${fileName}`
        : fileName;
      
      console.log(`Starting upload to ${options.bucketName}/${filePath}`);
      
      // Verificar se o bucket existe antes de fazer upload
      try {
        const { data, error } = await supabase.storage.getBucket(options.bucketName);
        
        if (error) {
          console.log(`Bucket ${options.bucketName} não existe ou não é acessível`);
          // Falha silenciosa - iremos tentar fazer upload mesmo assim, pois o bucket pode
          // existir mas o usuário pode não ter permissão para verificá-lo
        } else {
          console.log(`Bucket ${options.bucketName} exists:`, data);
        }
      } catch (bucketError) {
        console.warn(`Erro ao verificar bucket ${options.bucketName}:`, bucketError);
        // Continuamos, pois isso pode ser apenas um erro de permissão
      }
      
      // Upload do arquivo para o Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log(`File uploaded successfully: ${filePath}`);
      
      // Obter a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Erro ao fazer upload do arquivo:", error);
      
      // Tratamento específico para erros comuns de bucket
      if (error.message?.includes('bucket') || error.status === 404) {
        toast({
          title: "Erro no upload",
          description: "O bucket de armazenamento não existe ou você não tem permissão para acessá-lo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no upload",
          description: "Ocorreu um erro ao fazer o upload do arquivo.",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading
  };
}
