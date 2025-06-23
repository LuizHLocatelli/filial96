
import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Hook para lazy loading de componentes com cache
 */
export function useLazyComponent<T = {}>(
  importFunction: () => Promise<{ default: ComponentType<T> }>
): LazyExoticComponent<ComponentType<T>> {
  return lazy(importFunction);
}

/**
 * Preload de componente para carregamento antecipado
 */
export function preloadComponent(
  importFunction: () => Promise<{ default: ComponentType<any> }>
): Promise<{ default: ComponentType<any> }> {
  return importFunction();
}

/**
 * Hook para preload baseado em hover/focus
 */
export function usePreloadOnHover() {
  const preloadOnHover = (
    importFunction: () => Promise<{ default: ComponentType<any> }>
  ) => {
    return {
      onMouseEnter: () => preloadComponent(importFunction),
      onFocus: () => preloadComponent(importFunction),
    };
  };

  return { preloadOnHover };
}
