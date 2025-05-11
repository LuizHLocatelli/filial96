
import { useState, useEffect } from "react";
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
  
  // Ensure buckets exist when the hook is used
  useEffect(() => {
    const ensureBucketsExist = async () => {
      try {
        // Check if crediario_depositos bucket exists
        const { data: depositosData, error: depositosError } = await supabase
          .storage
          .getBucket('crediario_depositos');
        
        if (depositosError) {
          console.log('Error checking depositos bucket:', depositosError);
          // Create the bucket if it doesn't exist
          await supabase.storage.createBucket('crediario_depositos', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          console.log('Created crediario_depositos bucket');
        }
        
        // Check if crediario_listagens bucket exists
        const { data: listagensData, error: listagensError } = await supabase
          .storage
          .getBucket('crediario_listagens');
        
        if (listagensError) {
          console.log('Error checking listagens bucket:', listagensError);
          // Create the bucket if it doesn't exist
          await supabase.storage.createBucket('crediario_listagens', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          console.log('Created crediario_listagens bucket');
        }
      } catch (error) {
        console.error("Error checking/creating buckets:", error);
      }
    };
    
    ensureBucketsExist();
  }, []);

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
