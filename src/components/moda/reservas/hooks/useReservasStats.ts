
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ReservasStats } from '../types';

export function useReservasStats() {
  const [stats, setStats] = useState<ReservasStats>({
    total: 0,
    ativas: 0,
    convertidas: 0,
    expiradas: 0
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

      const ativas = reservas?.filter(r => r.status === 'ativa') || [];
      const convertidas = reservas?.filter(r => r.status === 'convertida') || [];
      const expiradas = reservas?.filter(r => r.status === 'expirada') || [];
      const total = reservas?.length || 0;

      setStats({
        total,
        ativas: ativas.length,
        convertidas: convertidas.length,
        expiradas: expiradas.length
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { stats, isLoading, fetchStats };
}
