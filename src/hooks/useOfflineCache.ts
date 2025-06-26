import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
}

interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface UseOfflineCacheOptions {
  key: string;
  ttl?: number; // Default 5 minutos
  enableSync?: boolean;
  maxRetries?: number;
}

export const useOfflineCache = <T>({
  key,
  ttl = 5 * 60 * 1000, // 5 minutos
  enableSync = true,
  maxRetries = 3
}: UseOfflineCacheOptions) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

  // Simple network status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Chaves para localStorage
  const cacheKey = `pwa_cache_${key}`;
  const syncKey = `pwa_sync_${key}`;
  const pendingKey = `pwa_pending_${key}`;

  // Salvar no cache local
  const saveToCache = useCallback((data: T, customTtl?: number) => {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: customTtl || ttl,
        version: '1.0'
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      setData(data);
      console.log(`💾 Cache salvo para: ${key}`);
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
    }
  }, [cacheKey, key, ttl]);

  // Carregar do cache local
  const loadFromCache = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const isExpired = now - cacheEntry.timestamp > cacheEntry.ttl;

      if (isExpired && isOnline) {
        console.log(`⏰ Cache expirado para: ${key}, limpando...`);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`📦 Cache carregado para: ${key}`, { 
        age: now - cacheEntry.timestamp,
        expired: isExpired 
      });
      return cacheEntry.data;
    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error);
      return null;
    }
  }, [cacheKey, key, isOnline]);

  // Salvar operação pendente para sync posterior
  const addPendingOperation = useCallback((operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingOperations(prev => {
      const updated = [...prev, newOperation];
      localStorage.setItem(pendingKey, JSON.stringify(updated));
      return updated;
    });

    console.log(`📝 Operação pendente adicionada:`, newOperation);
  }, [pendingKey]);

  // Executar operações pendentes quando online
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0) return;

    console.log(`🔄 Sincronizando ${pendingOperations.length} operações pendentes...`);
    
    const failedOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      try {
        // Aqui você integraria com sua API/Supabase
        console.log(`🔄 Executando operação:`, operation);
        
        // Simular operação (substituir pela implementação real)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`✅ Operação executada com sucesso:`, operation.id);
      } catch (error) {
        console.error(`❌ Erro na operação ${operation.id}:`, error);
        
        const updatedOperation = { 
          ...operation, 
          retryCount: operation.retryCount + 1 
        };
        
        if (updatedOperation.retryCount < maxRetries) {
          failedOperations.push(updatedOperation);
        } else {
          console.error(`❌ Operação ${operation.id} descartada após ${maxRetries} tentativas`);
        }
      }
    }

    setPendingOperations(failedOperations);
    localStorage.setItem(pendingKey, JSON.stringify(failedOperations));
    
    if (failedOperations.length === 0) {
      setLastSync(new Date());
      localStorage.setItem(syncKey, new Date().toISOString());
    }
  }, [isOnline, pendingOperations, maxRetries, syncKey, pendingKey]);

  // Carregar dados (cache first, depois network se online)
  const fetchData = useCallback(async (fetchFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    
    try {
      // Primeiro tenta carregar do cache
      const cachedData = loadFromCache();
      if (cachedData) {
        setData(cachedData);
        
        // Se offline, retorna dados do cache
        if (!isOnline) {
          setIsLoading(false);
          return cachedData;
        }
      }

      // Se online, tenta buscar dados atuais
      if (isOnline) {
        try {
          const freshData = await fetchFn();
          saveToCache(freshData);
          setIsLoading(false);
          return freshData;
        } catch (error) {
          console.error('❌ Erro ao buscar dados online:', error);
          // Se falhar online mas tem cache, usa cache
          if (cachedData) {
            setIsLoading(false);
            return cachedData;
          }
          throw error;
        }
      }
      
      setIsLoading(false);
      return cachedData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [loadFromCache, saveToCache, isOnline]);

  // Atualizar dados (salva local se offline, senão sincroniza)
  const updateData = useCallback(async (
    newData: T, 
    updateFn?: () => Promise<void>,
    operationInfo?: { table: string; type: 'CREATE' | 'UPDATE' | 'DELETE' }
  ) => {
    if (isOnline && updateFn) {
      try {
        await updateFn();
        saveToCache(newData);
        console.log(`✅ Dados atualizados online para: ${key}`);
      } catch (error) {
        console.error('❌ Erro ao atualizar online:', error);
        // Salva localmente e adiciona à fila de sync
        saveToCache(newData);
        if (operationInfo) {
          addPendingOperation({
            ...operationInfo,
            data: newData
          });
        }
        throw error;
      }
    } else {
      // Offline - salva localmente
      saveToCache(newData);
      if (operationInfo) {
        addPendingOperation({
          ...operationInfo,
          data: newData
        });
      }
      console.log(`💾 Dados salvos offline para: ${key}`);
    }
  }, [isOnline, saveToCache, addPendingOperation, key]);

  // Limpar cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(syncKey);
    localStorage.removeItem(pendingKey);
    setData(null);
    setPendingOperations([]);
    setLastSync(null);
    console.log(`🗑️ Cache limpo para: ${key}`);
  }, [cacheKey, syncKey, pendingKey, key]);

  // Carregar dados iniciais e operações pendentes
  useEffect(() => {
    // Carregar dados do cache
    const cachedData = loadFromCache();
    if (cachedData) {
      setData(cachedData);
    }

    // Carregar operações pendentes
    try {
      const pending = localStorage.getItem(pendingKey);
      if (pending) {
        setPendingOperations(JSON.parse(pending));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar operações pendentes:', error);
    }

    // Carregar último sync
    try {
      const lastSyncStr = localStorage.getItem(syncKey);
      if (lastSyncStr) {
        setLastSync(new Date(lastSyncStr));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar data do último sync:', error);
    }
  }, [loadFromCache, pendingKey, syncKey]);

  // Auto-sync quando ficar online
  useEffect(() => {
    if (isOnline && enableSync && pendingOperations.length > 0) {
      const timer = setTimeout(syncPendingOperations, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, enableSync, pendingOperations.length, syncPendingOperations]);

  return {
    data,
    isLoading,
    isOnline,
    lastSync,
    pendingOperations: pendingOperations.length,
    fetchData,
    updateData,
    saveToCache,
    clearCache,
    syncPendingOperations
  };
};
