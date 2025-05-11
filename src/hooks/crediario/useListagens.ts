
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFileUpload } from "./useFileUpload";

export interface Listagem {
  id: string;
  nome: string;
  fileUrl: string;
  createdAt: Date;
  indicator: string | null;
}

export function useListagens() {
  const [listagens, setListagens] = useState<Listagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();

  // Carregar listagens ao iniciar
  useEffect(() => {
    fetchListagens();
  }, []);

  // Buscar listagens do Supabase
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

  // Adicionar nova listagem
  const addListagem = async (file: File, indicator: string | null) => {
    if (!file) return false;

    try {
      // 1. Upload do arquivo para o Storage
      const fileUrl = await uploadFile(file, { bucketName: 'crediario_listagens' });
      
      if (!fileUrl) return false;

      // 2. Salvar metadados no banco de dados
      const { data, error } = await supabase
        .from('crediario_listagens')
        .insert({
          nome: file.name,
          url: fileUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          indicator: indicator
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newListagem: Listagem = {
          id: data[0].id,
          nome: data[0].nome,
          fileUrl: data[0].url,
          createdAt: new Date(data[0].created_at),
          indicator: data[0].indicator
        };
        
        setListagens(prevListagens => [newListagem, ...prevListagens]);
        
        toast({
          title: "Listagem adicionada",
          description: "A listagem foi adicionada com sucesso.",
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar listagem:", error);
      toast({
        title: "Erro ao adicionar listagem",
        description: "Ocorreu um erro ao adicionar a listagem.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Excluir listagem
  const deleteListagem = async (id: string, fileUrl: string) => {
    try {
      // 1. Extrair o caminho do arquivo da URL
      const urlParts = fileUrl.split('crediario_listagens/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // 2. Excluir o arquivo do Storage
        const { error: storageError } = await supabase.storage
          .from('crediario_listagens')
          .remove([filePath]);
          
        if (storageError) throw storageError;
      }
      
      // 3. Excluir registro do banco de dados
      const { error: dbError } = await supabase
        .from('crediario_listagens')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // 4. Atualizar estado local
      setListagens(prevListagens => prevListagens.filter(item => item.id !== id));
      
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
    deleteListagem,
    refreshListagens: fetchListagens
  };
}
