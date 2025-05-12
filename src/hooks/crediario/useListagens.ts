
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Listagem {
  id: string;
  nome: string;
  fileUrl: string; // This will be populated from url column
  createdAt: Date;
  indicator: string | null;
}

export function useListagens() {
  const [listagens, setListagens] = useState<Listagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      await ensureBucketExists();
      fetchListagens();
    };
    
    initialize();
  }, []);

  // Ensure the documents bucket exists
  const ensureBucketExists = async () => {
    try {
      console.log('Checking if documents bucket exists...');
      
      // Check if bucket exists
      const { data, error } = await supabase
        .storage
        .getBucket('documents');
      
      if (error) {
        console.log('Documents bucket does not exist, creating it now...');
        
        // Create the bucket if it doesn't exist
        const { data: bucketData, error: createError } = await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
        
        if (createError) {
          console.error("Failed to create bucket:", createError);
          toast({
            title: "Erro na configuração",
            description: "Não foi possível configurar o armazenamento. Tente novamente mais tarde.",
            variant: "destructive",
          });
          return false;
        }
        
        console.log('Documents bucket created successfully:', bucketData);
        return true;
      }
      
      console.log('Documents bucket exists:', data);
      return true;
    } catch (error) {
      console.error("Error checking/creating bucket:", error);
      return false;
    }
  };

  const fetchListagens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_listagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedListagens: Listagem[] = data.map(item => ({
          id: item.id,
          nome: item.nome,
          fileUrl: item.url, // Using the url field from database
          createdAt: new Date(item.created_at),
          indicator: item.indicator
        }));
        setListagens(formattedListagens);
      }
    } catch (error) {
      console.error("Erro ao carregar listagens:", error);
      toast({
        title: "Erro ao carregar listagens",
        description: "Ocorreu um erro ao carregar as listagens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addListagem = async (file: File, indicator: string | null): Promise<boolean> => {
    setIsUploading(true);
    try {
      // Ensure bucket exists before uploading
      const bucketExists = await ensureBucketExists();
      if (!bucketExists) {
        throw new Error("Não foi possível configurar o armazenamento para upload.");
      }
      
      // Transform indicator value
      const indicatorValue = indicator === "none" || !indicator ? null : indicator;
      
      const fileName = file.name;
      const filePath = `crediario/listagens/${Date.now()}_${fileName}`;
      
      console.log(`Starting upload to documents/${filePath}`);
      
      // Upload file to storage with better error handling
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("File uploaded successfully:", uploadData);
      
      // Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      console.log("Public URL generated:", publicUrlData.publicUrl);
      
      // Insert record in database
      const { error: insertError } = await supabase
        .from('crediario_listagens')
        .insert({
          nome: fileName,
          url: publicUrlData.publicUrl, // Using url field
          indicator: indicatorValue,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }
      
      console.log("Database record created successfully");
      
      toast({
        title: "Upload concluído",
        description: "A listagem foi adicionada com sucesso.",
      });
      
      await fetchListagens();
      return true;
    } catch (error: any) {
      console.error("Erro detalhado ao adicionar listagem:", error);
      toast({
        title: "Erro ao adicionar listagem",
        description: error.message || "Ocorreu um erro ao adicionar a listagem.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteListagem = async (id: string, fileUrl: string): Promise<boolean> => {
    try {
      // Get file path from URL
      const filePathMatch = fileUrl.match(/crediario\/listagens\/[^?]*/);
      const filePath = filePathMatch ? filePathMatch[0] : null;
      
      // Delete record from database
      const { error: deleteError } = await supabase
        .from('crediario_listagens')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      // Delete file from storage if we could extract the path
      if (filePath) {
        try {
          await supabase.storage
            .from('documents')
            .remove([filePath]);
        } catch (storageError) {
          console.error("Erro ao excluir arquivo de storage:", storageError);
        }
      }
      
      setListagens(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Listagem removida",
        description: "A listagem foi removida com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir listagem:", error);
      toast({
        title: "Erro ao remover listagem",
        description: "Ocorreu um erro ao remover a listagem.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    listagens,
    isLoading,
    isUploading,
    addListagem,
    deleteListagem
  };
}
