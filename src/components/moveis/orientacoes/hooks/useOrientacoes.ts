
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useOrientacoesMonitoring } from "../../hub-produtividade/hooks/useOrientacoesMonitoring";
import { Orientacao } from "../types";

export function useOrientacoes() {
  const { toast } = useToast();
  const { registerView, fetchMonitoringStats } = useOrientacoesMonitoring();
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
        tipo: item.tipo as 'vm' | 'informativo' | 'outro', // Type cast to proper union type
        arquivo_url: item.arquivo_url,
        arquivo_nome: item.arquivo_nome || '',
        arquivo_tipo: item.arquivo_tipo,
        data_criacao: item.data_criacao,
        criado_por: item.criado_por,
        criado_por_nome: 'Usuário' // Default value
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

  /**
   * Registra visualização de uma orientação e atualiza o monitoramento
   */
  const handleViewOrientacao = async (orientacaoId: string) => {
    try {
      const success = await registerView(orientacaoId);
      if (success) {
        // Atualizar estatísticas de monitoramento após registrar visualização
        await fetchMonitoringStats();
        console.log('✅ Visualização registrada e monitoramento atualizado');
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao registrar visualização:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchOrientacoes();
  }, []);

  return {
    orientacoes,
    isLoading,
    refetch: fetchOrientacoes,
    handleViewOrientacao
  };
}
