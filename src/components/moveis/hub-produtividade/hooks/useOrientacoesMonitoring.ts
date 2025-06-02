import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  OrientacaoMonitoramento, 
  MonitoramentoStats, 
  RoleCompletionStats,
  TargetRole 
} from '../types';

// Cargos que devem ser monitorados - definidos fora do hook para evitar recriação
const TARGET_ROLES: TargetRole[] = ['consultor_moveis', 'consultor_moda', 'jovem_aprendiz'];

export function useOrientacoesMonitoring() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [monitoramentoStats, setMonitoramentoStats] = useState<MonitoramentoStats>({
    total_orientacoes: 0,
    orientacoes_completas: 0,
    orientacoes_pendentes: 0,
    percentage_complete: 0,
    orientacoes: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Registra que o usuário atual visualizou uma orientação
   * Usa a função RPC específica para registrar visualizações
   */
  const registerView = useCallback(async (orientacaoId: string) => {
    if (!user) return false;

    try {
      const { error: rpcError } = await supabase.rpc('register_orientacao_view', {
        p_orientacao_id: orientacaoId,
        p_user_id: user.id
      });

      if (rpcError) throw rpcError;

      console.log('✅ Visualização registrada para orientação:', orientacaoId);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar visualização:', error);
      toast({
        title: "Erro ao registrar visualização",
        description: "Não foi possível registrar que você visualizou esta orientação.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  /**
   * Verifica se todos os usuários de determinados cargos visualizaram uma orientação
   * Usa a função RPC específica para verificar conclusão por cargo
   */
  const checkOrientacaoCompletion = useCallback(async (orientacaoId: string): Promise<RoleCompletionStats[]> => {
    try {
      const { data: response, error } = await supabase.rpc('check_orientacao_completion_by_role', {
        p_orientacao_id: orientacaoId,
        p_target_roles: TARGET_ROLES
      });

      if (error) throw error;

      // A função RPC agora retorna TABLE diretamente
      return Array.isArray(response) ? response as unknown as RoleCompletionStats[] : [];
    } catch (error) {
      console.error('❌ Erro ao verificar conclusão da orientação:', error);
      return [];
    }
  }, []);

  /**
   * Busca estatísticas completas de monitoramento
   * Usa as funções RPC otimizadas do Supabase
   */
  const fetchMonitoringStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usar a função RPC para obter estatísticas completas
      const { data: statsResponse, error: statsError } = await supabase.rpc('get_orientacoes_viewing_stats', {
        p_target_roles: TARGET_ROLES
      });

      if (statsError) throw statsError;

      // A função RPC agora retorna TABLE diretamente
      const statsData = Array.isArray(statsResponse) ? statsResponse : [];

      // Converter dados da função RPC para o formato esperado
      const orientacoesMonitoramento: OrientacaoMonitoramento[] = statsData.map((item: any) => ({
        orientacao_id: item.orientacao_id,
        titulo: item.titulo,
        tipo: item.tipo,
        data_criacao: item.data_criacao,
        viewing_stats: Array.isArray(item.viewing_stats) ? item.viewing_stats : []
      }));

      // Calcular estatísticas gerais
      const totalOrientacoes = orientacoesMonitoramento.length;
      let orientacoesCompletas = 0;

      orientacoesMonitoramento.forEach(orientacao => {
        const allRolesComplete = orientacao.viewing_stats.length > 0 && 
          orientacao.viewing_stats.every(stat => stat.is_complete);
        if (allRolesComplete) {
          orientacoesCompletas++;
        }
      });

      const orientacoesPendentes = totalOrientacoes - orientacoesCompletas;
      const percentageComplete = totalOrientacoes > 0 ? 
        Math.round((orientacoesCompletas / totalOrientacoes) * 100) : 0;

      const stats: MonitoramentoStats = {
        total_orientacoes: totalOrientacoes,
        orientacoes_completas: orientacoesCompletas,
        orientacoes_pendentes: orientacoesPendentes,
        percentage_complete: percentageComplete,
        orientacoes: orientacoesMonitoramento
      };

      setMonitoramentoStats(stats);

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de monitoramento:', error);
      setError('Erro ao carregar estatísticas de monitoramento');
      toast({
        title: "Erro ao carregar monitoramento",
        description: "Não foi possível carregar as estatísticas de visualização.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  /**
   * Obtém usuários pendentes para uma orientação específica
   */
  const getPendingUsers = useCallback((orientacaoId: string) => {
    const orientacao = monitoramentoStats.orientacoes.find(o => o.orientacao_id === orientacaoId);
    if (!orientacao) return [];

    const allPendingUsers: any[] = [];
    orientacao.viewing_stats.forEach(stat => {
      allPendingUsers.push(...stat.pending_users);
    });

    return allPendingUsers;
  }, [monitoramentoStats]);

  /**
   * Verifica se uma orientação específica foi completamente visualizada
   */
  const isOrientacaoComplete = useCallback((orientacaoId: string): boolean => {
    const orientacao = monitoramentoStats.orientacoes.find(o => o.orientacao_id === orientacaoId);
    if (!orientacao) return false;

    return orientacao.viewing_stats.every(stat => stat.is_complete);
  }, [monitoramentoStats]);

  /**
   * Obtém estatísticas de um cargo específico para uma orientação
   */
  const getRoleStats = useCallback((orientacaoId: string, role: TargetRole): RoleCompletionStats | null => {
    const orientacao = monitoramentoStats.orientacoes.find(o => o.orientacao_id === orientacaoId);
    if (!orientacao) return null;

    return orientacao.viewing_stats.find(stat => stat.role === role) || null;
  }, [monitoramentoStats]);

  /**
   * Verifica se o usuário atual já visualizou uma orientação
   */
  const hasUserViewedOrientacao = useCallback(async (orientacaoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('moveis_orientacoes_visualizacoes')
        .select('id')
        .eq('orientacao_id', orientacaoId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }, [user]);

  // Carregar dados automaticamente quando o usuário for carregado
  useEffect(() => {
    if (user) {
      fetchMonitoringStats();
    }
  }, [user]); // Removido fetchMonitoringStats das dependências para evitar loop

  return {
    // Estado
    monitoramentoStats,
    isLoading,
    error,
    
    // Ações
    registerView,
    checkOrientacaoCompletion,
    fetchMonitoringStats,
    
    // Utilitários
    getPendingUsers,
    isOrientacaoComplete,
    getRoleStats,
    hasUserViewedOrientacao,
    
    // Configuração
    targetRoles: TARGET_ROLES
  };
} 