import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Escala, EscalaFormData, ConflitosEscala } from '../types/escalasTypes';

export function useEscalas(mes: number, ano: number, modoTeste: boolean = false) {
  const queryClient = useQueryClient();

  // Buscar escalas do mês
  const { data: escalas = [], isLoading, error } = useQuery({
    queryKey: ['escalas', mes, ano, modoTeste],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('obter_escalas_mes', {
          mes_param: mes,
          ano_param: ano,
          modo_teste_param: modoTeste
        });

      if (error) throw error;
      return data as Escala[];
    }
  });

  // Criar escala
  const criarEscalaMutation = useMutation({
    mutationFn: async (escalaData: EscalaFormData) => {
      const { data, error } = await supabase
        .from('escalas')
        .insert([escalaData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success('Escala criada com sucesso!');
    },
    onError: (error: any) => {
      let message = error.message || 'Erro ao criar escala';

      // Tratar erro de constraint única de forma amigável
      if (error.code === '23505' || message.includes('escalas_funcionario_id_data_modo_teste_key')) {
        message = 'Este funcionário já possui uma escala nesta data. Um funcionário não pode ter múltiplas escalas no mesmo dia.';
      }

      toast.error(message);
    }
  });

  // Atualizar escala
  const atualizarEscalaMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Escala> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('escalas')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success('Escala atualizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao atualizar escala';
      toast.error(message);
    }
  });

  // Deletar escala
  const deletarEscalaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('escalas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success('Escala removida com sucesso!');
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao remover escala';
      toast.error(message);
    }
  });

  // Verificar conflitos
  const verificarConflitos = useCallback(async (
    funcionarioId: string,
    dataInicio: string,
    dataFim: string
  ): Promise<ConflitosEscala[]> => {
    const { data, error } = await supabase
      .rpc('verificar_conflitos_escala', {
        funcionario_id_param: funcionarioId,
        data_inicio_param: dataInicio,
        data_fim_param: dataFim,
        modo_teste_param: modoTeste
      });

    if (error) {
      console.error('Erro ao verificar conflitos:', error);
      return [];
    }

    return data || [];
  }, [modoTeste]);

  // Aplicar escalas de teste
  const aplicarEscalasTeste = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('aplicar_escalas_teste');
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success(`${count} escalas aplicadas com sucesso!`);
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao aplicar escalas de teste';
      toast.error(message);
    }
  });

  // Descartar escalas de teste
  const descartarEscalasTeste = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('descartar_escalas_teste');
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
      toast.success(`${count} escalas de teste descartadas!`);
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao descartar escalas de teste';
      toast.error(message);
    }
  });

  return {
    escalas,
    isLoading,
    error,
    criarEscala: criarEscalaMutation.mutateAsync,
    atualizarEscala: atualizarEscalaMutation.mutateAsync,
    deletarEscala: deletarEscalaMutation.mutateAsync,
    verificarConflitos,
    aplicarEscalasTeste: aplicarEscalasTeste.mutateAsync,
    descartarEscalasTeste: descartarEscalasTeste.mutateAsync,
    isCriando: criarEscalaMutation.isPending,
    isAtualizando: atualizarEscalaMutation.isPending,
    isDeletando: deletarEscalaMutation.isPending
  };
}
