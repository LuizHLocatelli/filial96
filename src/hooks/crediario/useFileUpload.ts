
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
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = options.folder 
        ? `${options.folder}/${fileName}`
        : fileName;
      
      console.log(`Starting upload to ${options.bucketName}/${filePath}`);
      
      // Upload file to Supabase Storage
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
      
      // Get public URL of the file
      const { data: urlData } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      
      if (error.message?.includes('bucket') || error.status === 404) {
        toast({
          title: "Upload error",
          description: "Storage bucket does not exist or you don't have permission to access it.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload error",
          description: "An error occurred while uploading the file.",
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
