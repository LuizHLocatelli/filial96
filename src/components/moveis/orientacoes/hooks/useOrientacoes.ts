
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Orientacao } from "../types";

export function useOrientacoes() {
  const { toast } = useToast();
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrientacoes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('moveis_orientacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      const orientacoesFormatted: Orientacao[] = data?.map(item => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        tipo: item.tipo,
        arquivo_url: item.arquivo_url,
        arquivo_nome: item.arquivo_nome || '',
        arquivo_tipo: item.arquivo_tipo,
        data_criacao: item.data_criacao,
        criado_por: item.criado_por,
        criado_por_nome: 'Usuário'
      })) || [];

      setOrientacoes(orientacoesFormatted);
    } catch (error) {
      console.error('Erro ao buscar orientações:', error);
      toast({
        title: "Erro ao carregar orientações",
        description: "Não foi possível carregar as orientações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrientacoes();
  }, []);

  return {
    orientacoes,
    isLoading,
    refetch: fetchOrientacoes
  };
}
