/**
 * Utilitário para gerenciar cache do PWA
 * Resolve problemas de cache persistente
 */

export class CacheManager {
  /**
   * Limpa todos os caches do service worker
   */
  static async clearAllCaches(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        console.log('🗑️ Limpando caches:', cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ Removendo cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        
        console.log('✅ Todos os caches foram limpos');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao limpar caches:', error);
      return false;
    }
  }

  /**
   * Limpa cache específico por nome
   */
  static async clearCacheByName(cacheName: string): Promise<boolean> {
    try {
      if ('caches' in window) {
        const deleted = await caches.delete(cacheName);
        console.log(`🗑️ Cache ${cacheName} ${deleted ? 'removido' : 'não encontrado'}`);
        return deleted;
      }
      return false;
    } catch (error) {
      console.error(`❌ Erro ao limpar cache ${cacheName}:`, error);
      return false;
    }
  }

  /**
   * Limpa caches relacionados ao Supabase
   */
  static async clearSupabaseCaches(): Promise<boolean> {
    try {
      const supabaseCaches = ['supabase-cache', 'pages-cache'];
      let success = true;
      
      for (const cacheName of supabaseCaches) {
        const deleted = await this.clearCacheByName(cacheName);
        if (!deleted) success = false;
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao limpar caches do Supabase:', error);
      return false;
    }
  }

  /**
   * Força atualização do service worker
   */
  static async updateServiceWorker(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          console.log('🔄 Atualizando service worker...');
          await registration.update();
          
          // Se há um SW esperando, ativa imediatamente
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          
          console.log('✅ Service worker atualizado');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar service worker:', error);
      return false;
    }
  }

  /**
   * Força reload completo da aplicação
   */
  static forceReload(): void {
    // Limpa localStorage relacionado ao cache
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.includes('cache') || key.includes('version') || key.includes('sw')
    );
    
    cacheKeys.forEach(key => {
      console.log(`🗑️ Removendo localStorage: ${key}`);
      localStorage.removeItem(key);
    });

    // Força reload sem cache
    window.location.reload();
  }

  /**
   * Procedimento completo de limpeza
   */
  static async performFullCacheReset(): Promise<void> {
    console.log('🚀 Iniciando limpeza completa de cache...');
    
    try {
      // 1. Limpar todos os caches
      await this.clearAllCaches();
      
      // 2. Atualizar service worker
      await this.updateServiceWorker();
      
      // 3. Aguardar um pouco e recarregar
      setTimeout(() => {
        console.log('🔄 Recarregando aplicação...');
        this.forceReload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro durante limpeza completa:', error);
      // Força reload mesmo com erro
      this.forceReload();
    }
  }

  /**
   * Verifica se há service worker ativo
   */
  static async isServiceWorkerActive(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration?.active;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Obtém informações sobre caches ativos
   */
  static async getCacheInfo(): Promise<Array<{name: string, size: number}>> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cacheInfo = [];
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          cacheInfo.push({ name, size: keys.length });
        }
        
        return cacheInfo;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao obter info dos caches:', error);
      return [];
    }
  }
}

// Função utilitária para usar em componentes
export const useCacheManager = () => ({
  clearAllCaches: CacheManager.clearAllCaches,
  clearSupabaseCaches: CacheManager.clearSupabaseCaches,
  updateServiceWorker: CacheManager.updateServiceWorker,
  forceReload: CacheManager.forceReload,
  performFullCacheReset: CacheManager.performFullCacheReset,
  isServiceWorkerActive: CacheManager.isServiceWorkerActive,
  getCacheInfo: CacheManager.getCacheInfo,
});