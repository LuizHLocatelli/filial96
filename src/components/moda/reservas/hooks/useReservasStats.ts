
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ReservasStats } from '../types';

export function useReservasStats() {
  const [stats, setStats] = useState<ReservasStats>({
    total_ativas: 0,
    expirando_24h: 0,
    taxa_conversao: 0,
    valor_total_reservado: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Buscar todas as reservas para calcular estatísticas
      const { data: reservas, error } = await supabase
        .from('moda_reservas')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const ativas = reservas?.filter(r => r.status === 'ativa') || [];
      const expirandoEm24h = ativas.filter(r => new Date(r.data_expiracao) <= in24Hours);
      const convertidas = reservas?.filter(r => r.status === 'convertida') || [];
      const total = reservas?.length || 0;

      const taxaConversao = total > 0 ? (convertidas.length / total) * 100 : 0;

      setStats({
        total_ativas: ativas.length,
        expirando_24h: expirandoEm24h.length,
        taxa_conversao: Math.round(taxaConversao),
        valor_total_reservado: 0 // Pode ser calculado se tivermos preços
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, isLoading, fetchStats };
}
