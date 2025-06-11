import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductivityStats, 
  ActivityItem
} from '../types';
import { useRotinasData } from './useRotinasData';
import { useOrientacoesData } from './useOrientacoesData';
import { useTarefasData } from './useTarefasData';
import { useUsersCache } from './useUsersCache';
import { calculateProductivityStats } from '../utils/statsCalculator';
import { generateActivityTimeline } from '../utils/activityGenerator';
import { useResponsive } from '@/hooks/use-responsive';

export function useHubData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  
  // Ref para controlar se é a primeira carga
  const isInitialLoadRef = useRef(true);
  const lastRefreshRef = useRef<number>(0);
  
  const [stats, setStats] = useState<ProductivityStats>({
    rotinas: {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      atrasadas: 0,
      percentualConclusao: 0
    },
    orientacoes: {
      total: 0,
      lidas: 0,
      naoLidas: 0,
      recentes: 0
    },
    tarefas: {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      atrasadas: 0,
      percentualConclusao: 0
    },
    produtividade: {
      score: 0,
      meta: 85
    }
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Usar os novos hooks especializados
  const { 
    rotinas, 
    isLoading: isLoadingRotinas, 
    error: rotinasError,
    refetch: refetchRotinas 
  } = useRotinasData();
  
  const { 
    orientacoes, 
    isLoading: isLoadingOrientacoes, 
    error: orientacoesError,
    refetch: refetchOrientacoes 
  } = useOrientacoesData();
  
  const { 
    tarefas, 
    isLoading: isLoadingTarefas, 
    error: tarefasError,
    refetch: refetchTarefas 
  } = useTarefasData();

  const { getUserName, isLoading: isLoadingUsers } = useUsersCache();

  // Usar useMemo para evitar recálculos desnecessários - MOVIDO PARA ANTES DO DEBUG
  const allDataLoaded = useMemo(() => {
    return !isLoadingRotinas && !isLoadingOrientacoes && !isLoadingTarefas && !isLoadingUsers;
  }, [isLoadingRotinas, isLoadingOrientacoes, isLoadingTarefas, isLoadingUsers]);

  // Debug logs para mobile - VERSÃO MELHORADA
  useEffect(() => {
    if (isMobile) {
      console.log('📱 [MOBILE DEBUG] useHubData Estado Detalhado:', {
        statsTotal: stats.rotinas.total + stats.tarefas.total,
        isLoadingStats,
        isLoadingActivities,
        isLoadingRotinas,
        isLoadingOrientacoes,
        isLoadingTarefas,
        isLoadingUsers,
        allDataLoaded,
        rotinasCount: rotinas.length,
        orientacoesCount: orientacoes.length,
        tarefasCount: tarefas.length,
        userExists: !!user,
        isInitialLoad: isInitialLoadRef.current
      });
    }
  }, [isMobile, stats, isLoadingStats, isLoadingActivities, isLoadingRotinas, isLoadingOrientacoes, isLoadingTarefas, isLoadingUsers, rotinas, orientacoes, tarefas, allDataLoaded, user]);

  // Memoizar os dados para evitar recalculos
  const memoizedRotinas = useMemo(() => rotinas, [JSON.stringify(rotinas)]);
  const memoizedOrientacoes = useMemo(() => orientacoes, [JSON.stringify(orientacoes)]);
  const memoizedTarefas = useMemo(() => tarefas, [JSON.stringify(tarefas)]);

  // ===== REFRESH DADOS COM FEEDBACK CONTROLADO =====
  const refreshData = useCallback(async () => {
    // Evitar refresh múltiplo em pouco tempo
    const now = Date.now();
    if (now - lastRefreshRef.current < 2000) {
      console.log('🚫 Refresh muito recente, pulando...');
      return;
    }
    lastRefreshRef.current = now;

    console.log('🔄 Atualizando dados do hub...');
    
    // Só mostra toast de loading se não for a primeira carga
    if (!isInitialLoadRef.current) {
      toast({
        title: "🔄 Atualizando dados...",
        description: "Carregando informações mais recentes",
      });
    }
    
    try {
      await Promise.all([
        refetchRotinas(),
        refetchOrientacoes(),
        refetchTarefas()
      ]);
      
      // Só mostra toast de sucesso se não for a primeira carga
      /* if (!isInitialLoadRef.current) {
        toast({
          title: "✅ Dados atualizados",
          description: "Informações carregadas com sucesso",
        });
      } */
    } catch (error) {
      console.error('❌ Erro no refresh:', error);
      if (!isInitialLoadRef.current) {
        toast({
          title: "❌ Erro na atualização",
          description: "Alguns dados podem não ter sido atualizados",
          variant: "destructive",
        });
      }
    }
  }, [refetchRotinas, refetchOrientacoes, refetchTarefas, toast]);

  // ===== EFFECTS =====
  // Effect apenas para primeira carga quando user está disponível
  useEffect(() => {
    if (user && isInitialLoadRef.current) {
      refreshData().finally(() => {
        isInitialLoadRef.current = false;
      });
    }
  }, [user]); // Removido refreshData das dependências para evitar loop

  // Effect para calcular estatísticas quando os dados mudarem (usando useMemo para quebrar ciclos)
  useEffect(() => {
    if (!allDataLoaded) return;

    try {
      setIsLoadingStats(true);
      
      // Calcular estatísticas - mesmo que não tenha dados
      const newStats = calculateProductivityStats(memoizedRotinas, memoizedOrientacoes, memoizedTarefas);
      setStats(newStats);
      
      // Gerar atividades - mesmo que não tenha dados
      const newActivities = generateActivityTimeline(memoizedRotinas, memoizedOrientacoes, memoizedTarefas, getUserName);
      setActivities(newActivities);
      
      console.log('📊 Estatísticas calculadas:', newStats);
      
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    }
  }, [allDataLoaded, memoizedRotinas, memoizedOrientacoes, memoizedTarefas, getUserName]);

  // Estados de erro consolidados
  const errors = {
    rotinas: rotinasError,
    orientacoes: orientacoesError,
    tarefas: tarefasError
  };

  return {
    // Data
    stats,
    activities,
    rotinas: memoizedRotinas,
    orientacoes: memoizedOrientacoes,
    tarefas: memoizedTarefas,
    
    // Loading states
    isLoadingStats,
    isLoadingActivities,
    isLoadingRotinas,
    isLoadingOrientacoes,
    isLoadingTarefas,
    isLoading: isLoadingStats || isLoadingActivities,
    
    // Error states
    errors,
    
    // Actions
    refreshData,
    fetchRotinas: refetchRotinas,
    fetchOrientacoes: refetchOrientacoes,
    fetchTarefas: refetchTarefas
  };
}
