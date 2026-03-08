import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { PastaGerencial } from "../types";

/**
 * Hook dedicado para buscar TODAS as pastas (usado no MoveItemDialog).
 * Separado do usePastasGerenciais para evitar chamada duplicada com filtro diferente.
 */
export function useAllPastas() {
  const { user } = useAuth();

  const { data: allPastas, isLoading } = useQuery({
    queryKey: ['pastas_gerenciais_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gerencial_pastas')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as PastaGerencial[];
    },
    enabled: !!user,
  });

  return { allPastas, isLoading };
}
