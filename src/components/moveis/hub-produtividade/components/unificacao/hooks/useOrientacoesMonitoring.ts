
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export function useOrientacoesMonitoring() {
  const [refreshOrientacoes, setRefreshOrientacoes] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const { data: visualizadas, error: errorVisualizadas } = await supabase
          .from('moveis_orientacoes_visualizacoes')
          .select('orientacao_id')
          .eq('user_id', user.id);
        
        if (errorVisualizadas) throw errorVisualizadas;
        
        const idsVisualizadas = visualizadas?.map(v => v.orientacao_id) || [];
        
        let query = supabase
          .from('moveis_orientacoes')
          .select('id');
        
        if (idsVisualizadas.length > 0) {
          query = query.not('id', 'in', `(${idsVisualizadas.map(id => `'${id}'`).join(',')})`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error("Erro ao buscar informativos não lidos:", error);
      }
    };
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user, refreshOrientacoes]);

  const handleUploadOrientacaoSuccess = () => {
    setRefreshOrientacoes(prev => prev + 1);
  };

  return {
    unreadCount,
    refreshOrientacoes,
    handleUploadOrientacaoSuccess,
  };
}
