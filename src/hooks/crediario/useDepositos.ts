
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFileUpload } from "./useFileUpload";

export interface Deposito {
  id: string;
  data: Date;
  concluido: boolean;
  comprovante: string | null;
  jaIncluido?: boolean; // New field
}

export function useDepositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();

  // Carregar depósitos ao iniciar
  useEffect(() => {
    fetchDepositos();
  }, []);

  // Buscar depósitos do Supabase
  const fetchDepositos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_depositos')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedDepositos: Deposito[] = data.map(item => ({
          id: item.id,
          data: new Date(item.data),
          concluido: item.concluido ?? true,
          comprovante: item.comprovante,
          jaIncluido: item.ja_incluido === true
        }));
        setDepositos(formattedDepositos);
      }
    } catch (error) {
      console.error("Erro ao carregar depósitos:", error);
      toast({
        title: "Erro ao carregar depósitos",
        description: "Ocorreu um erro ao carregar os depósitos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar ou atualizar depósito
  const saveDeposito = async (deposito: Partial<Deposito>, file: File | null = null) => {
    try {
      let comprovanteUrl = deposito.comprovante;
      
      // Se tem novo arquivo, fazer upload
      if (file) {
        comprovanteUrl = await uploadFile(file, { bucketName: 'crediario_depositos' });
        if (!comprovanteUrl && !deposito.id) return false;
      }
      
      if (deposito.id) {
        // Atualizar depósito existente
        const { error } = await supabase
          .from('crediario_depositos')
          .update({ 
            concluido: deposito.concluido,
            comprovante: comprovanteUrl,
            ja_incluido: deposito.jaIncluido
          })
          .eq('id', deposito.id);
          
        if (error) throw error;
        
        // Atualizar estado local
        setDepositos(prevDepositos => 
          prevDepositos.map(item => 
            item.id === deposito.id 
              ? { 
                  ...item, 
                  concluido: !!deposito.concluido, 
                  comprovante: comprovanteUrl,
                  jaIncluido: deposito.jaIncluido
                } 
              : item
          )
        );
        
        toast({
          title: "Depósito atualizado",
          description: `Depósito de ${format(deposito.data!, "dd/MM/yyyy")} atualizado com sucesso.`,
        });
      } else {
        // Criar novo depósito
        if (!deposito.data) throw new Error("Data é obrigatória");
        
        const newDeposito = {
          data: format(deposito.data, 'yyyy-MM-dd'),
          concluido: deposito.concluido ?? true,
          comprovante: comprovanteUrl,
          ja_incluido: deposito.jaIncluido,
          created_by: (await supabase.auth.getUser()).data.user?.id
        };
        
        const { data, error } = await supabase
          .from('crediario_depositos')
          .insert(newDeposito)
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          const createdDeposito: Deposito = {
            id: data[0].id,
            data: new Date(data[0].data),
            concluido: data[0].concluido,
            comprovante: data[0].comprovante,
            jaIncluido: data[0].ja_incluido === true
          };
          
          setDepositos(prevDepositos => [createdDeposito, ...prevDepositos]);
          
          toast({
            title: "Depósito registrado",
            description: `Depósito de ${format(deposito.data, "dd/MM/yyyy")} registrado com sucesso.`,
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar depósito:", error);
      toast({
        title: "Erro ao salvar depósito",
        description: "Ocorreu um erro ao salvar o depósito.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Excluir depósito
  const deleteDeposito = async (id: string, comprovante: string | null) => {
    try {
      // Se tiver comprovante, excluir do storage
      if (comprovante) {
        const urlParts = comprovante.split('crediario_depositos/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          
          const { error: storageError } = await supabase.storage
            .from('crediario_depositos')
            .remove([filePath]);
            
          if (storageError) throw storageError;
        }
      }
      
      // Excluir registro do banco de dados
      const { error: dbError } = await supabase
        .from('crediario_depositos')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // Atualizar estado local
      setDepositos(prevDepositos => prevDepositos.filter(item => item.id !== id));
      
      toast({
        title: "Depósito removido",
        description: "O depósito foi removido com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir depósito:", error);
      toast({
        title: "Erro ao remover depósito",
        description: "Ocorreu um erro ao remover o depósito.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    depositos,
    isLoading,
    isUploading,
    saveDeposito,
    deleteDeposito,
    refreshDepositos: fetchDepositos
  };
}
