import { useCallback } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import { calculateRotinaStatus } from '../utils/statusCalculator';
import { RotinaWithStatus, RotinaConclusao } from '../types';

interface RotinaRaw {
  id: string;
  nome: string;
  descricao?: string;
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'personalizado';
  horario_preferencial?: string;
  dia_preferencial: string;
  categoria: string;
  ativo: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useRotinasData() {
  // Buscar rotinas
  const { 
    data: rotinasRaw, 
    isLoading: isLoadingRotinas, 
    error: rotinasError,
    refetch: refetchRotinas 
  } = useSupabaseQuery<RotinaRaw>(
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
  } = useSupabaseQuery<RotinaConclusao>(
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

  // Função de refetch mais estável
  const refetch = useCallback(async () => {
    const promises = [];
    if (refetchRotinas) promises.push(refetchRotinas());
    if (refetchConclusoes) promises.push(refetchConclusoes());
    
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }, []); // Array vazio para manter estável

  return {
    rotinas,
    isLoading: isLoadingRotinas || isLoadingConclusoes,
    error: rotinasError,
    refetch
  };
}
