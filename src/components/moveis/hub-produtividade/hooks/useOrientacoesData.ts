
import { useSupabaseQuery } from './useSupabaseQuery';
import { Orientacao } from '../types';

export function useOrientacoesData() {
  const { 
    data: orientacoesRaw, 
    isLoading, 
    error,
    refetch 
  } = useSupabaseQuery(
    'orientações',
    async (supabase) => {
      const { data: orientacoesData, error } = await supabase
        .from('moveis_orientacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      // Buscar nomes dos criadores de forma otimizada
      const creatorIds = [...new Set(orientacoesData?.map(o => o.criado_por) || [])];
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', creatorIds);

        const orientacoesFormatted: Orientacao[] = orientacoesData?.map(item => ({
          ...item,
          criado_por_nome: profiles?.find(p => p.id === item.criado_por)?.name || 'Usuário'
        })) || [];

        return { data: orientacoesFormatted, error: null };
      }

      return { data: orientacoesData || [], error: null };
    }
  );

  return {
    orientacoes: orientacoesRaw,
    isLoading,
    error,
    refetch
  };
}
