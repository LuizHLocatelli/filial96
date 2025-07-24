import { useCallback } from 'react';
import { CacheManager } from '@/utils/cacheManager';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para controle de cache PWA
 * Pode ser usado em qualquer componente para gerenciar cache
 */
export function useCacheControl() {
  const clearAllCaches = useCallback(async () => {
    try {
      const success = await CacheManager.clearAllCaches();
      if (success) {
        toast({
          title: "✅ Cache Limpo",
          description: "Todos os caches foram removidos. A aplicação pode ficar mais lenta temporariamente.",
        });
        return true;
      } else {
        throw new Error('Falha ao limpar cache');
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível limpar o cache. Tente recarregar a página.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const clearSupabaseCaches = useCallback(async () => {
    try {
      const success = await CacheManager.clearSupabaseCaches();
      if (success) {
        toast({
          title: "🗄️ Cache do Supabase Limpo",
          description: "Dados serão recarregados do servidor na próxima requisição.",
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível limpar cache do Supabase",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const forceAppUpdate = useCallback(async () => {
    toast({
      title: "🔄 Atualizando Aplicação",
      description: "Limpando cache e recarregando...",
    });
    
    // Dar tempo para o toast aparecer
    setTimeout(() => {
      CacheManager.performFullCacheReset();
    }, 1500);
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const hasUpdate = await CacheManager.updateServiceWorker();
      if (hasUpdate) {
        toast({
          title: "🆕 Atualização Disponível",
          description: "Uma nova versão foi encontrada. Clique para recarregar.",
        });
        
        // Perguntar se quer recarregar
        setTimeout(() => {
          if (confirm('Nova versão disponível! Recarregar agora?')) {
            window.location.reload();
          }
        }, 2000);
      } else {
        toast({
          title: "✅ App Atualizado",
          description: "Você já está usando a versão mais recente.",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  }, []);

  return {
    clearAllCaches,
    clearSupabaseCaches,
    forceAppUpdate,
    checkForUpdates,
  };
}

/**
 * Hook especializado para situações de emergência
 * Quando o usuário reporta que o app não está atualizando
 */
export function useEmergencyCacheReset() {
  const { forceAppUpdate } = useCacheControl();

  const emergencyReset = useCallback(() => {
    if (confirm(
      '⚠️ RESET DE EMERGÊNCIA\n\n' +
      'Isso vai:\n' +
      '• Limpar TODOS os caches\n' +
      '• Forçar recarregamento completo\n' +
      '• Pode causar perda de dados não salvos\n\n' +
      'Continuar?'
    )) {
      toast({
        title: "🚨 Reset de Emergência Iniciado",
        description: "Limpando todos os caches e recarregando...",
        variant: "destructive"
      });
      
      forceAppUpdate();
    }
  }, [forceAppUpdate]);

  return { emergencyReset };
}