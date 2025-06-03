
import { useSupabaseQuery } from './useSupabaseQuery';
import { Tarefa } from '../types';

export function useTarefasData() {
  const { 
    data: tarefas, 
    isLoading, 
    error,
    refetch 
  } = useSupabaseQuery<Tarefa>(
    'tarefas',
    (supabase) => supabase
      .from('moveis_tarefas')
      .select('*')
      .order('data_criacao', { ascending: false })
  );

  return {
    tarefas,
    isLoading,
    error,
    refetch
  };
}
