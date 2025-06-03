
import { useCallback } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import { calculateRotinaStatus } from '../utils/statusCalculator';
import { RotinaWithStatus, RotinaConclusao } from '../types';

export function useRotinasData() {
  // Buscar rotinas
  const { 
    data: rotinasRaw, 
    isLoading: isLoadingRotinas, 
    error: rotinasError,
    refetch: refetchRotinas 
  } = useSupabaseQuery(
    'rotinas',
    (supabase) => supabase
      .from('moveis_rotinas')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
  );

  // Buscar conclusões
  const { 
    data: conclusoes, 
    isLoading: isLoadingConclusoes,
    refetch: refetchConclusoes 
  } = useSupabaseQuery(
    'conclusões de rotinas',
    (supabase) => supabase
      .from('moveis_rotinas_conclusoes')
      .select('*')
      .order('created_at', { ascending: false })
  );

  // Processar rotinas com status
  const rotinas: RotinaWithStatus[] = rotinasRaw.map(rotina => {
    const conclusoesRotina = conclusoes.filter(c => c.rotina_id === rotina.id);
    const conclusaoMaisRecente = conclusoesRotina
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    const status = calculateRotinaStatus(rotina, conclusoes);

    return {
      ...rotina,
      periodicidade: rotina.periodicidade as 'diario' | 'semanal' | 'mensal' | 'personalizado',
      status,
      conclusao: conclusaoMaisRecente
    } as RotinaWithStatus;
  });

  const refetch = useCallback(async () => {
    await Promise.all([refetchRotinas(), refetchConclusoes()]);
  }, [refetchRotinas, refetchConclusoes]);

  return {
    rotinas,
    isLoading: isLoadingRotinas || isLoadingConclusoes,
    error: rotinasError,
    refetch
  };
}
