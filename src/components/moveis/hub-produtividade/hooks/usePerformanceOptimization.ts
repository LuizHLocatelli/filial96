import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Interface para cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live em segundos
  maxSize?: number;
  persistToStorage?: boolean;
  storageKey?: string;
}

// Hook para cache inteligente
export function useSmartCache<T>(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutos por padrão
    maxSize = 100,
    persistToStorage = true,
    storageKey = 'hub-cache'
  } = options;

  const cache = useRef(new Map<string, CacheEntry<T>>());
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar cache do localStorage
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const now = Date.now();
          
          // Filtrar entradas expiradas
          Object.entries(parsed).forEach(([key, entry]) => {
            const cacheEntry = entry as CacheEntry<T>;
            if (cacheEntry.expiresAt > now) {
              cache.current.set(key, cacheEntry);
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao carregar cache do localStorage:', error);
      }
      setIsInitialized(true);
    }
  }, [persistToStorage, storageKey]);

  // Salvar cache no localStorage
  const saveToStorage = useCallback(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const cacheObject = Object.fromEntries(cache.current);
        localStorage.setItem(storageKey, JSON.stringify(cacheObject));
      } catch (error) {
        console.warn('Erro ao salvar cache no localStorage:', error);
      }
    }
  }, [persistToStorage, storageKey]);

  // Limpar entradas expiradas
  const cleanExpired = useCallback(() => {
    const now = Date.now();
    const expired: string[] = [];
    
    cache.current.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        expired.push(key);
      }
    });
    
    expired.forEach(key => cache.current.delete(key));
    
    if (expired.length > 0) {
      saveToStorage();
    }
  }, [saveToStorage]);

  // Limpar cache antigo quando necessário
  const evictOldest = useCallback(() => {
    if (cache.current.size >= maxSize) {
      const entries = Array.from(cache.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = Math.ceil(maxSize * 0.1); // Remove 10% das entradas mais antigas
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        cache.current.delete(entries[i][0]);
      }
      
      saveToStorage();
    }
  }, [maxSize, saveToStorage]);

  // Definir item no cache
  const set = useCallback((key: string, data: T) => {
    cleanExpired();
    evictOldest();
    
    const now = Date.now();
    cache.current.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttl * 1000)
    });
    
    saveToStorage();
  }, [ttl, cleanExpired, evictOldest, saveToStorage]);

  // Obter item do cache
  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) return null;
    
    if (entry.expiresAt <= Date.now()) {
      cache.current.delete(key);
      saveToStorage();
      return null;
    }
    
    return entry.data;
  }, [saveToStorage]);

  // Verificar se existe
  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key);
    return entry ? entry.expiresAt > Date.now() : false;
  }, []);

  // Remover item
  const remove = useCallback((key: string) => {
    const deleted = cache.current.delete(key);
    if (deleted) {
      saveToStorage();
    }
    return deleted;
  }, [saveToStorage]);

  // Limpar todo o cache
  const clear = useCallback(() => {
    cache.current.clear();
    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [persistToStorage, storageKey]);

  // Obter estatísticas do cache
  const getStats = useCallback(() => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    cache.current.forEach(entry => {
      if (entry.expiresAt > now) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });
    
    return {
      total: cache.current.size,
      valid: validEntries,
      expired: expiredEntries,
      hitRate: cache.current.size > 0 ? validEntries / cache.current.size : 0
    };
  }, []);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getStats,
    isInitialized
  };
}

// Hook para lazy loading otimizado
interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoad(options: LazyLoadOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible && triggerOnce) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isVisible, hasTriggered };
}

// Hook para debounce otimizado
export function useOptimizedDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para memoização avançada
export function useAdvancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxAge?: number;
    serialize?: boolean;
  } = {}
) {
  const { maxAge = 60000, serialize = false } = options; // 1 minuto por padrão
  const cacheRef = useRef<{ value: T; timestamp: number; deps: string }>({
    value: undefined as any,
    timestamp: 0,
    deps: ''
  });

  return useMemo(() => {
    const now = Date.now();
    const depsKey = serialize ? JSON.stringify(deps) : deps.join(',');
    
    // Verificar se o cache ainda é válido
    if (
      cacheRef.current.value !== undefined &&
      cacheRef.current.deps === depsKey &&
      (now - cacheRef.current.timestamp) < maxAge
    ) {
      return cacheRef.current.value;
    }

    // Calcular novo valor
    const newValue = factory();
    cacheRef.current = {
      value: newValue,
      timestamp: now,
      deps: depsKey
    };

    return newValue;
  }, deps);
}

// Hook para throttle otimizado
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]) as T;
}

// Hook para monitoramento de performance
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    totalTime: 0
  });

  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - startTime.current;
    
    setMetrics(prev => {
      const newTotalTime = prev.totalTime + renderTime;
      return {
        renderCount: renderCount.current,
        averageRenderTime: newTotalTime / renderCount.current,
        lastRenderTime: renderTime,
        totalTime: newTotalTime
      };
    });

    // Log performance em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: renderTime.toFixed(2) + 'ms',
        renderCount: renderCount.current
      });
    }

    startTime.current = performance.now();
  });

  return metrics;
}

// Hook para prevenção de memory leaks
export function useMemoryLeak() {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback(<T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => {
    return (value: T | ((prev: T) => T)) => {
      if (mountedRef.current) {
        setter(value);
      }
    };
  }, []);

  return { isMounted: () => mountedRef.current, safeSetState };
}

// Hook para batching de updates
export function useBatchedUpdates<T>(initialValue: T, batchDelay: number = 16) {
  const [value, setValue] = useState<T>(initialValue);
  const pendingUpdate = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const resolvedValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(pendingUpdate.current ?? value)
      : newValue;
    
    pendingUpdate.current = resolvedValue;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (pendingUpdate.current !== null) {
        setValue(pendingUpdate.current);
        pendingUpdate.current = null;
      }
    }, batchDelay);
  }, [value, batchDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, batchedSetValue] as const;
}

// Hook principal que combina todas as otimizações
export function usePerformanceOptimization(componentName: string) {
  const cache = useSmartCache({ ttl: 300, maxSize: 50 });
  const performanceMetrics = usePerformanceMonitor(componentName);
  const memoryLeakPrevention = useMemoryLeak();

  return {
    cache,
    performanceMetrics,
    ...memoryLeakPrevention,
    // Utilidades
    useLazyLoad,
    useOptimizedDebounce,
    useAdvancedMemo,
    useThrottle,
    useBatchedUpdates
  };
} 