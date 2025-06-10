
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RotinaWithStatus } from "../../../rotinas/types";

export function useTarefaRotinaConnection(tarefaRotinaId: string | null) {
  const { toast } = useToast();
  const [rotinaRelacionada, setRotinaRelacionada] = useState<RotinaWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tarefaRotinaId) {
      carregarRotinaRelacionada();
    } else {
      setIsLoading(false);
    }
  }, [tarefaRotinaId]);

  const carregarRotinaRelacionada = async () => {
    if (!tarefaRotinaId) return;

    try {
      setIsLoading(true);
      
      const { data: rotina, error } = await supabase
        .from('moveis_rotinas')
        .select('*')
        .eq('id', tarefaRotinaId)
        .single();

      if (error) throw error;

      // Add status property to match RotinaWithStatus type
      setRotinaRelacionada({
        ...rotina,
        status: 'pendente' // Default status
      } as RotinaWithStatus);
    } catch (error) {
      console.error('Erro ao carregar rotina relacionada:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a rotina relacionada",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rotinaRelacionada,
    isLoading
  };
}
