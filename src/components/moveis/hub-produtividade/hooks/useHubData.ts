
import { useState, useEffect, useCallback, useRef } from 'react';
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

export function useHubData() {
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  // ===== CALCULAR ESTATÍSTICAS =====
  const calculateStats = useCallback(() => {
    if (!rotinas.length && !orientacoes.length && !tarefas.length) return;

    try {
      const newStats = calculateProductivityStats(rotinas, orientacoes, tarefas);
      setStats(newStats);
      console.log('📊 Estatísticas calculadas:', newStats);
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
    }
  }, [rotinas, orientacoes, tarefas]);

  // ===== GERAR TIMELINE DE ATIVIDADES =====
  const generateActivities = useCallback(() => {
    const newActivities = generateActivityTimeline(rotinas, orientacoes, tarefas, getUserName);
    setActivities(newActivities);
  }, [rotinas, orientacoes, tarefas, getUserName]);

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
      if (!isInitialLoadRef.current) {
        toast({
          title: "✅ Dados atualizados",
          description: "Informações carregadas com sucesso",
        });
      }
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
  }, [refetchRotinas, refetchOrientacoes, refetchTarefas]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (user) {
      refreshData().finally(() => {
        isInitialLoadRef.current = false;
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingRotinas && !isLoadingOrientacoes && !isLoadingTarefas && !isLoadingUsers) {
      setIsLoadingStats(true);
      calculateStats();
      generateActivities();
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    }
  }, [isLoadingRotinas, isLoadingOrientacoes, isLoadingTarefas, isLoadingUsers, calculateStats, generateActivities]);

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
    rotinas,
    orientacoes,
    tarefas,
    
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
