
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
          fileUrl: item.url,
          createdAt: new Date(item.created_at),
          indicator: item.indicator
        }));
        setListagens(formattedListagens);
      }
    } catch (error) {
      console.error("Error loading listagens:", error);
      toast({
        title: "Error loading listagens",
        description: "An error occurred while loading the listagens.",
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
      
      // Use the uploadFile function from useFileUpload
      const fileUrl = await uploadFile(file, {
        bucketName: 'crediario_listagens',
        folder: 'pdfs'
      });
      
      if (!fileUrl) {
        throw new Error("Could not upload file.");
      }
      
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
      
      toast({
        title: "Upload complete",
        description: "The listagem was added successfully.",
      });
      
      await fetchListagens();
      return true;
    } catch (error: any) {
      console.error("Detailed error when adding listagem:", error);
      toast({
        title: "Error adding listagem",
        description: error.message || "An error occurred while adding the listagem.",
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
      
      // Try to delete file from storage
      try {
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/');
        
        // Extract path without the /storage/v1/object/public/ prefix
        let filePath = '';
        
        if (pathParts.includes('pdfs')) {
          // Get the path starting from 'pdfs'
          const pdfIndex = pathParts.indexOf('pdfs');
          filePath = pathParts.slice(pdfIndex).join('/');
        } else {
          // Fallback to just the filename
          filePath = pathParts[pathParts.length - 1];
        }
        
        console.log(`Attempting to delete file: bucket=crediario_listagens, path=${filePath}`);
        
        const { error: storageError } = await supabase.storage
          .from('crediario_listagens')
          .remove([filePath]);
          
        if (storageError) {
          console.warn("Warning: Could not delete file from storage:", storageError);
        }
      } catch (storageError) {
        console.warn("Warning: Error parsing file URL or deleting from storage:", storageError);
      }
      
      setListagens(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Listagem removed",
        description: "The listagem was removed successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting listagem:", error);
      toast({
        title: "Error removing listagem",
        description: "An error occurred while removing the listagem.",
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
