import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConexaoStats {
  total_tarefas: number;
  score_conexoes: number;
}

export function useConexoes() {
  const [stats, setStats] = useState<ConexaoStats>({
    total_tarefas: 0,
    score_conexoes: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      // Buscar tarefas
      const { data: tarefas, error: tarefasError } = await supabase
        .from('moveis_tarefas')
        .select('id');

      if (tarefasError) throw tarefasError;

      const totalTarefas = tarefas?.length || 0;
      const scoreConexoes = 0;

      setStats({
        total_tarefas: totalTarefas,
        score_conexoes: scoreConexoes
      });
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchStats();
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stats,
    loading,
    error,
    refresh
  };
}
