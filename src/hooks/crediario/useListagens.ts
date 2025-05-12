
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
      const fileExt = fileName.split('.').pop();
      const filePath = `crediario/listagens/${Date.now()}_${fileName}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      // Insert record in database
      const { error: insertError } = await supabase
        .from('crediario_listagens')
        .insert({
          nome: fileName,
          url: publicUrlData.publicUrl, // Using url field
          indicator: indicatorValue,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "Upload concluído",
        description: "A listagem foi adicionada com sucesso.",
      });
      
      await fetchListagens();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar listagem:", error);
      toast({
        title: "Erro ao adicionar listagem",
        description: "Ocorreu um erro ao adicionar a listagem.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteListagem = async (id: string, fileUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filePath = `crediario/listagens/${urlParts[urlParts.length - 1]}`;
      
      // Delete record from database
      const { error: deleteError } = await supabase
        .from('crediario_listagens')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      // Delete file from storage
      try {
        await supabase.storage
          .from('documents')
          .remove([filePath]);
      } catch (storageError) {
        console.error("Erro ao excluir arquivo de storage:", storageError);
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
