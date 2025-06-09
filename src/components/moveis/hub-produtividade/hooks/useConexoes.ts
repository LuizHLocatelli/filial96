import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConexaoStats {
  total_rotinas: number;
  rotinas_com_tarefas: number;
  total_tarefas: number;
  tarefas_de_rotinas: number;
  score_conexoes: number;
}

export function useConexoes() {
  const [stats, setStats] = useState<ConexaoStats>({
    total_rotinas: 0,
    rotinas_com_tarefas: 0,
    total_tarefas: 0,
    tarefas_de_rotinas: 0,
    score_conexoes: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      // Buscar rotinas ativas
      const { data: rotinas, error: rotinasError } = await supabase
        .from('moveis_rotinas')
        .select('id')
        .eq('ativo', true);

      if (rotinasError) throw rotinasError;

      // Buscar tarefas (sem rotina_id por enquanto, até migração ser aplicada)
      const { data: tarefas, error: tarefasError } = await supabase
        .from('moveis_tarefas')
        .select('id');

      if (tarefasError) throw tarefasError;

      const totalRotinas = rotinas?.length || 0;
      const totalTarefas = tarefas?.length || 0;
      
      // Por enquanto, valores padrão até a migração ser aplicada
      const tarefasDeRotinas = 0;
      const rotinasComTarefas = 0;
      const scoreConexoes = 0;

      setStats({
        total_rotinas: totalRotinas,
        rotinas_com_tarefas: rotinasComTarefas,
        total_tarefas: totalTarefas,
        tarefas_de_rotinas: tarefasDeRotinas,
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
  }, []);

  return {
    stats,
    loading,
    error,
    refresh
  };
} 