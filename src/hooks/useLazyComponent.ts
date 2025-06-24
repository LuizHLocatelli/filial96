import { lazy, ComponentType, LazyExoticComponent, useState, useEffect, useCallback } from 'react';
import { lazyLoadingMetrics } from '@/utils/lazyLoadingMetrics';

interface LazyComponentOptions {
  preloadDelay?: number;
  retryAttempts?: number;
  enableMetrics?: boolean;
  strategy?: 'immediate' | 'visible' | 'hover' | 'idle';
}

/**
 * Hook avançado para lazy loading de componentes com cache e métricas
 */
export function useLazyComponent<T = {}>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  componentName: string,
  options: LazyComponentOptions = {}
): LazyExoticComponent<ComponentType<T>> {
  const {
    retryAttempts = 3,
    enableMetrics = true,
    strategy = 'immediate'
  } = options;

  return lazy(() => {
    if (enableMetrics) {
      lazyLoadingMetrics.startLoading(componentName);
    }

    const loadWithRetry = async (attempts: number = 0): Promise<{ default: ComponentType<T> }> => {
      try {
        const module = await importFunction();
        
        if (enableMetrics) {
          lazyLoadingMetrics.endLoading(componentName);
        }
        
        return module;
      } catch (error) {
        if (attempts < retryAttempts) {
          console.warn(`Tentativa ${attempts + 1} falhou para ${componentName}. Tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
          return loadWithRetry(attempts + 1);
        }
        
        console.error(`Falha ao carregar componente ${componentName} após ${retryAttempts} tentativas:`, error);
        throw error;
      }
    };

    return loadWithRetry();
  });
}

/**
 * Sistema de cache para componentes carregados
 */
class ComponentCache {
  private cache = new Map<string, Promise<{ default: ComponentType<any> }>>();
  private loadedComponents = new Set<string>();

  preload(
    key: string,
    importFunction: () => Promise<{ default: ComponentType<any> }>
  ): Promise<{ default: ComponentType<any> }> {
    if (!this.cache.has(key)) {
      this.cache.set(key, importFunction());
    }
    return this.cache.get(key)!;
  }

  isLoaded(key: string): boolean {
    return this.loadedComponents.has(key);
  }

  markAsLoaded(key: string): void {
    this.loadedComponents.add(key);
  }

  clear(): void {
    this.cache.clear();
    this.loadedComponents.clear();
  }

  getStats() {
    return {
      cached: this.cache.size,
      loaded: this.loadedComponents.size
    };
  }
}

export const componentCache = new ComponentCache();

/**
 * Preload de componente para carregamento antecipado com cache
 */
export function preloadComponent(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  componentName?: string
): Promise<{ default: ComponentType<any> }> {
  const key = componentName || importFunction.toString();
  return componentCache.preload(key, importFunction);
}

/**
 * Hook para preload baseado em estratégias diferentes
 */
export function usePreloadOnHover() {
  const preloadOnHover = (
    importFunction: () => Promise<{ default: ComponentType<any> }>,
    componentName?: string
  ) => {
    const key = componentName || importFunction.toString();
    
    return {
      onMouseEnter: () => {
        if (!componentCache.isLoaded(key)) {
          preloadComponent(importFunction, componentName);
        }
      },
      onFocus: () => {
        if (!componentCache.isLoaded(key)) {
          preloadComponent(importFunction, componentName);
        }
      },
    };
  };

  return { preloadOnHover };
}

/**
 * Hook para preload baseado em visibilidade (Intersection Observer)
 */
export function usePreloadOnVisible() {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  const preloadOnVisible = useCallback((
    importFunction: () => Promise<{ default: ComponentType<any> }>,
    componentName?: string,
    threshold: number = 0.1
  ) => {
    const key = componentName || importFunction.toString();
    
    useEffect(() => {
      if (!ref || componentCache.isLoaded(key)) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preloadComponent(importFunction, componentName);
              observer.disconnect();
            }
          });
        },
        { threshold }
      );

      observer.observe(ref);
      return () => observer.disconnect();
    }, [ref, key, importFunction, componentName, threshold]);

    return setRef;
  }, [ref]);

  return { preloadOnVisible };
}

/**
 * Hook para preload quando o browser estiver idle
 */
export function usePreloadOnIdle() {
  const preloadOnIdle = useCallback((
    importFunction: () => Promise<{ default: ComponentType<any> }>,
    componentName?: string,
    timeout: number = 5000
  ) => {
    const key = componentName || importFunction.toString();
    
    useEffect(() => {
      if (componentCache.isLoaded(key)) return;

      const requestIdleCallback = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(cb, timeout));
      
      const idleHandle = requestIdleCallback(() => {
        preloadComponent(importFunction, componentName);
      });

      return () => {
        if ((window as any).cancelIdleCallback) {
          (window as any).cancelIdleCallback(idleHandle);
        } else {
          clearTimeout(idleHandle);
        }
      };
    }, [key, importFunction, componentName, timeout]);
  }, []);

  return { preloadOnIdle };
}

/**
 * Lazy loading para bibliotecas externas pesadas
 */
export class ExternalLibraryLoader {
  private static instances = new Map<string, Promise<any>>();

  static async loadLibrary(
    libraryName: string,
    importFunction: () => Promise<any>,
    enableMetrics: boolean = true
  ): Promise<any> {
    if (!this.instances.has(libraryName)) {
      if (enableMetrics) {
        lazyLoadingMetrics.startLoading(`library-${libraryName}`);
      }

      const promise = importFunction().then(module => {
        if (enableMetrics) {
          lazyLoadingMetrics.endLoading(`library-${libraryName}`);
        }
        return module;
      }).catch(error => {
        console.error(`Erro ao carregar biblioteca ${libraryName}:`, error);
        this.instances.delete(libraryName);
        throw error;
      });

      this.instances.set(libraryName, promise);
    }

    return this.instances.get(libraryName)!;
  }

  static preloadLibrary(libraryName: string, importFunction: () => Promise<any>): void {
    this.loadLibrary(libraryName, importFunction, false);
  }

  static isLoaded(libraryName: string): boolean {
    return this.instances.has(libraryName);
  }

  static clear(): void {
    this.instances.clear();
  }
}
