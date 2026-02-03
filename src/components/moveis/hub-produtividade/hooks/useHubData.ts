import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductivityStats, 
} from '../types';
import { useUsersCache } from './useUsersCache';
import { useResponsive } from '@/hooks/use-responsive';

export function useHubData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  
  // Ref para controlar se é a primeira carga
  const isInitialLoadRef = useRef(true);
  const lastRefreshRef = useRef<number>(0);
  
  const [stats, setStats] = useState<ProductivityStats>({
    produtividade: {
      score: 0
    }
  });
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const { getUserName, isLoading: isLoadingUsers } = useUsersCache();

  // Usar useMemo para evitar recálculos desnecessários - MOVIDO PARA ANTES DO DEBUG
  const allDataLoaded = useMemo(() => {
    return !isLoadingUsers;
  }, [isLoadingUsers]);

  // Debug logs para mobile - VERSÃO MELHORADA
  useEffect(() => {
    if (isMobile) {
      console.log('📱 [MOBILE DEBUG] useHubData Estado Detalhado:', {
        isLoadingStats,
        isLoadingUsers,
        allDataLoaded,
        userExists: !!user,
        isInitialLoad: isInitialLoadRef.current
      });
    }
  }, [isMobile, stats, isLoadingStats, isLoadingUsers, allDataLoaded, user]);

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
      // Não há mais dados de orientações para buscar
      
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
  }, [toast]);

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
      
      // Calcular estatísticas vazias (sem orientações)
      const newStats = {
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
  }, [allDataLoaded]);

  // Estados de erro consolidados
  const errors = {};

  return {
    // Data
    stats,
    
    // Loading states
    isLoadingStats,
    isLoading: isLoadingStats,
    
    // Error states
    errors,
    
    // Actions
    refreshData,
    fetchOrientacoes: async () => {} // Função vazia para compatibilidade
  };
}
