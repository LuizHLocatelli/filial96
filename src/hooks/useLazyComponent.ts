import { lazy, ComponentType, LazyExoticComponent, useState, useEffect, useCallback } from 'react';

interface LazyComponentOptions {
  preloadDelay?: number;
  retryAttempts?: number;
  enableMetrics?: boolean;
  strategy?: 'immediate' | 'visible' | 'hover' | 'idle';
}

/**
 * Hook avançado para lazy loading de componentes com cache e métricas
 */
export function useLazyComponent<T = Record<string, unknown>>(
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
    const loadWithRetry = async (attempts: number = 0): Promise<{ default: ComponentType<T> }> => {
      try {
        return await importFunction();
      } catch (error) {
        if (attempts < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
          return loadWithRetry(attempts + 1);
        }
        throw error;
      }
    };

    return loadWithRetry();
  });
}

/**
 * Sistema de cache para componentes carregados
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentImport = { default: ComponentType<any> };

class ComponentCache {
  private cache = new Map<string, Promise<ComponentImport>>();
  private loadedComponents = new Set<string>();

  preload(
    key: string,
    importFunction: () => Promise<ComponentImport>
  ): Promise<ComponentImport> {
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
  importFunction: () => Promise<ComponentImport>,
  componentName?: string
): Promise<ComponentImport> {
  const key = componentName || importFunction.toString();
  return componentCache.preload(key, importFunction);
}

/**
 * Hook para preload baseado em estratégias diferentes
 */
export function usePreloadOnHover() {
  const preloadOnHover = (
    importFunction: () => Promise<ComponentImport>,
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
export function usePreloadOnVisible(
  importFunction: () => Promise<ComponentImport>,
  componentName?: string,
  threshold: number = 0.1
) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
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

  return { ref, setRef };
}

/**
 * Hook para preload quando o browser estiver idle
 */
export function usePreloadOnIdle(
  importFunction: () => Promise<ComponentImport>,
  componentName?: string,
  timeout: number = 5000
) {
  const key = componentName || importFunction.toString();
  
  useEffect(() => {
    if (componentCache.isLoaded(key)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestIdleCallback = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, timeout));
    
    const idleHandle = requestIdleCallback(() => {
      preloadComponent(importFunction, componentName);
    });

    return () => {
      if (typeof idleHandle === 'number') {
        clearTimeout(idleHandle);
      }
    };
  }, [key, importFunction, componentName, timeout]);
}

/**
 * Lazy loading para bibliotecas externas pesadas
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LibraryModule = any;

export class ExternalLibraryLoader {
  private static instances = new Map<string, Promise<LibraryModule>>();

  static async loadLibrary(
    libraryName: string,
    importFunction: () => Promise<LibraryModule>,
  ): Promise<LibraryModule> {
    if (!this.instances.has(libraryName)) {
      const promise = importFunction().catch(error => {
        console.error(`Erro ao carregar biblioteca ${libraryName}:`, error);
        this.instances.delete(libraryName);
        throw error;
      });

      this.instances.set(libraryName, promise);
    }

    return this.instances.get(libraryName)!;
  }

  static preloadLibrary(libraryName: string, importFunction: () => Promise<LibraryModule>): void {
    this.loadLibrary(libraryName, importFunction);
  }

  static isLoaded(libraryName: string): boolean {
    return this.instances.has(libraryName);
  }

  static clear(): void {
    this.instances.clear();
  }
}
