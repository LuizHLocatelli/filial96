
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
      
      // Upload do arquivo para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter a URL pública do arquivo
      const { data } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer o upload do arquivo.",
        variant: "destructive",
      });
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
