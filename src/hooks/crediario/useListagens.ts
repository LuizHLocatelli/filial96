
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFileUpload } from "@/hooks/crediario/useFileUpload";

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
  const { uploadFile } = useFileUpload();

  useEffect(() => {
    fetchListagens();
  }, []);

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
      // Transform indicator value
      const indicatorValue = indicator === "none" || !indicator ? null : indicator;
      
      const fileName = file.name;
      
      console.log("Starting file upload via useFileUpload");
      
      // Use the uploadFile function from useFileUpload
      const fileUrl = await uploadFile(file, {
        bucketName: 'crediario_listagens',
        folder: 'pdfs'
      });
      
      if (!fileUrl) {
        throw new Error("Não foi possível fazer o upload do arquivo.");
      }
      
      console.log("File uploaded successfully, URL:", fileUrl);
      
      // Insert record in database
      const { error: insertError } = await supabase
        .from('crediario_listagens')
        .insert({
          nome: fileName,
          url: fileUrl,
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
      // Delete record from database first
      const { error: deleteError } = await supabase
        .from('crediario_listagens')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      // Try to delete file from storage if possible
      try {
        // Extract bucket and path from URL
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/');
        const bucketName = pathParts[1] === 'storage' ? pathParts[2] : 'crediario_listagens';
        
        // Get file path without bucket and "object" part
        let filePath = pathParts.slice(pathParts.indexOf(bucketName) + 2).join('/');
        
        // Remove query parameters if present
        filePath = filePath.split('?')[0];
        
        console.log(`Attempting to delete file: bucket=${bucketName}, path=${filePath}`);
        
        if (bucketName && filePath) {
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);
            
          if (storageError) {
            console.warn("Warning: Could not delete file from storage:", storageError);
          }
        }
      } catch (storageError) {
        // Just log storage deletion errors, but don't fail the operation
        console.warn("Warning: Error parsing file URL or deleting from storage:", storageError);
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
