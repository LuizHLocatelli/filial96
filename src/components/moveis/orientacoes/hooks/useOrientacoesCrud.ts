
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Orientacao } from "../types";

export function useOrientacoesCrud() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateOrientacao = async (id: string, data: Partial<Orientacao>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('moveis_orientacoes')
        .update({
          titulo: data.titulo,
          descricao: data.descricao,
          tipo: data.tipo
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Orientação atualizada com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar orientação:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a orientação",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrientacao = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('moveis_orientacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Orientação excluída com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir orientação:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível excluir a orientação",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrientacao,
    deleteOrientacao,
    isLoading
  };
}
