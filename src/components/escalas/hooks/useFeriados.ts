import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Feriado } from '../types/escalasTypes';

export function useFeriados(ano?: number) {
  const queryClient = useQueryClient();

  // Buscar feriados
  const { data: feriados = [], isLoading } = useQuery({
    queryKey: ['feriados', ano],
    queryFn: async () => {
      let query = supabase
        .from('feriados')
        .select('*')
        .order('data', { ascending: true });

      // Se ano for fornecido, filtrar pelo ano
      if (ano) {
        const dataInicio = `${ano}-01-01`;
        const dataFim = `${ano}-12-31`;
        query = query.gte('data', dataInicio).lte('data', dataFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Feriado[];
    }
  });

  // Criar feriado
  const criarFeriadoMutation = useMutation({
    mutationFn: async (feriado: Omit<Feriado, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('feriados')
        .insert([feriado])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feriados'] });
      toast.success('Feriado cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cadastrar feriado');
    }
  });

  // Atualizar feriado
  const atualizarFeriadoMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Feriado> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('feriados')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feriados'] });
      toast.success('Feriado atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar feriado');
    }
  });

  // Deletar feriado
  const deletarFeriadoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feriados')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feriados'] });
      toast.success('Feriado removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover feriado');
    }
  });

  return {
    feriados,
    isLoading,
    criarFeriado: criarFeriadoMutation.mutateAsync,
    atualizarFeriado: atualizarFeriadoMutation.mutateAsync,
    deletarFeriado: deletarFeriadoMutation.mutateAsync
  };
}
