import { ComponentType } from 'react';

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
}

const componentCache = new ComponentCache();

function preloadComponent(
  importFunction: () => Promise<ComponentImport>,
  componentName?: string
): Promise<ComponentImport> {
  const key = componentName || importFunction.toString();
  return componentCache.preload(key, importFunction);
}

/**
 * Hook para preload de componentes no hover
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
