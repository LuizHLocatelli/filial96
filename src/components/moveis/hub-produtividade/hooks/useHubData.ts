import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductivityStats, 
} from '../types';
import { useOrientacoesData } from './useOrientacoesData';
import { useUsersCache } from './useUsersCache';
import { calculateProductivityStats } from '../utils/statsCalculator';
import { useResponsive } from '@/hooks/use-responsive';

export function useHubData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  
  // Ref para controlar se é a primeira carga
  const isInitialLoadRef = useRef(true);
  const lastRefreshRef = useRef<number>(0);
  
  const [stats, setStats] = useState<ProductivityStats>({
    orientacoes: {
      total: 0,
      lidas: 0,
      naoLidas: 0,
      recentes: 0
    },
    produtividade: {
      score: 0
    }
  });
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Usar os novos hooks especializados
  const { 
    orientacoes, 
    isLoading: isLoadingOrientacoes, 
    error: orientacoesError,
    refetch: refetchOrientacoes 
  } = useOrientacoesData();

  const { getUserName, isLoading: isLoadingUsers } = useUsersCache();

  // Usar useMemo para evitar recálculos desnecessários - MOVIDO PARA ANTES DO DEBUG
  const allDataLoaded = useMemo(() => {
    return !isLoadingOrientacoes && !isLoadingUsers;
  }, [isLoadingOrientacoes, isLoadingUsers]);

  // Debug logs para mobile - VERSÃO MELHORADA
  useEffect(() => {
    if (isMobile) {
      console.log('📱 [MOBILE DEBUG] useHubData Estado Detalhado:', {
        statsTotal: stats.orientacoes.total,
        isLoadingStats,
        isLoadingOrientacoes,
        isLoadingUsers,
        allDataLoaded,
        orientacoesCount: orientacoes.length,
        userExists: !!user,
        isInitialLoad: isInitialLoadRef.current
      });
    }
  }, [isMobile, stats, isLoadingStats, isLoadingOrientacoes, isLoadingUsers, orientacoes, allDataLoaded, user]);

  // Memoizar os dados para evitar recalculos
  const memoizedOrientacoes = useMemo(() => orientacoes, [JSON.stringify(orientacoes)]);

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
        refetchOrientacoes()
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
  }, [refetchOrientacoes, toast]);

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
      
      // Calcular estatísticas apenas com orientações (vazio temporariamente)
      const newStats = {
        ...stats,
        orientacoes: {
          total: orientacoes.length,
          lidas: 0, // Não temos esse dado ainda
          naoLidas: 0, // Não temos esse dado ainda
          recentes: 0 // Não temos esse dado ainda
        },
        produtividade: {
          score: 0
        }
      };
      setStats(newStats);
      
      console.log('📊 Estatísticas calculadas:', newStats);
      
      setIsLoadingStats(false);
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      setIsLoadingStats(false);
    }
  }, [allDataLoaded, orientacoes]);

  // Estados de erro consolidados
  const errors = {
    orientacoes: orientacoesError
  };

  return {
    // Data
    stats,
    orientacoes: memoizedOrientacoes,
    
    // Loading states
    isLoadingStats,
    isLoadingOrientacoes,
    isLoading: isLoadingStats,
    
    // Error states
    errors,
    
    // Actions
    refreshData,
    fetchOrientacoes: refetchOrientacoes
  };
}
