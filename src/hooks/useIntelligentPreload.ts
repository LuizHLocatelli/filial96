import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadComponent, componentCache, ExternalLibraryLoader } from './useLazyComponent';

interface RoutePattern {
  from: string;
  to: string;
  probability: number;
  preloadDelay?: number;
}

interface PreloadStrategy {
  route: string;
  components: string[];
  libraries: string[];
  priority: 'high' | 'medium' | 'low';
}

const ROUTE_PATTERNS: RoutePattern[] = [
  { from: '/', to: '/crediario', probability: 0.7, preloadDelay: 2000 },
  { from: '/', to: '/moveis', probability: 0.6, preloadDelay: 3000 },
  { from: '/crediario', to: '/depositos', probability: 0.8, preloadDelay: 1000 },
  { from: '/moda', to: '/reservas', probability: 0.6, preloadDelay: 2000 },
  { from: '/', to: '/cards-promocionais', probability: 0.4, preloadDelay: 5000 },
];

const PRELOAD_STRATEGIES: PreloadStrategy[] = [
  {
    route: '/',
    components: ['Crediario', 'Moveis', 'MetricsChart'],
    libraries: ['recharts'],
    priority: 'high'
  },
  {
    route: '/crediario',
    components: ['DepositFormDialog', 'ClienteFormDialog', 'ContactsChart'],
    libraries: ['recharts', 'date-fns'],
    priority: 'high'
  },
  {
    route: '/moveis',
    components: [],
    libraries: ['recharts'],
    priority: 'medium'
  },
  {
    route: '/moda',
    components: ['ReservaCard'],
    libraries: ['recharts'],
    priority: 'medium'
  },
  {
    route: '/cards-promocionais',
    components: ['UploadCardDialog', 'CardEditDialog'],
    libraries: [],
    priority: 'low'
  }
];

const COMPONENT_IMPORTS: Record<string, () => Promise<any>> = {
  'Crediario': () => import('../pages/Crediario'),
  'Moveis': () => import('../pages/Moveis'),
  'Moda': () => import('../pages/Moda'),
  'DepositFormDialog': () => import('../components/crediario/depositos/DepositFormDialog'),
  'ReservaCard': () => import('../components/moda/reservas/components/ReservaCard'),
  'UploadCardDialog': () => import('../components/promotional-cards/UploadCardDialog'),
  'CardEditDialog': () => import('../components/promotional-cards/CardEditDialog'),
};

const LIBRARY_IMPORTS: Record<string, () => Promise<any>> = {
  'recharts': () => import('recharts'),
  'jspdf': () => import('jspdf'),
  'date-fns': () => import('date-fns'),
  'pdfjs-dist': () => import('pdfjs-dist'),
};

export function useIntelligentPreload() {
  const location = useLocation();
  const [preloadedRoutes, setPreloadedRoutes] = useState(new Set<string>());
  const [preloadedComponents, setPreloadedComponents] = useState(new Set<string>());

  useEffect(() => {
    const currentPath = location.pathname;
    sessionStorage.setItem('previousRoute', currentPath);
  }, [location.pathname]);

  const preloadByRoute = useCallback(async (currentPath: string) => {
    const relevantPatterns = ROUTE_PATTERNS.filter(pattern => pattern.from === currentPath);
    
    for (const pattern of relevantPatterns) {
      if (preloadedRoutes.has(pattern.to)) continue;
      
      if (pattern.probability > 0.3) {
        setTimeout(() => {
          if (COMPONENT_IMPORTS[pattern.to.slice(1)]) {
            preloadComponent(COMPONENT_IMPORTS[pattern.to.slice(1)], pattern.to);
            setPreloadedRoutes(prev => new Set([...prev, pattern.to]));
          }
        }, pattern.preloadDelay || 2000);
      }
    }
  }, [preloadedRoutes]);

  const preloadByStrategy = useCallback(async (currentPath: string) => {
    const strategy = PRELOAD_STRATEGIES.find(s => s.route === currentPath);
    if (!strategy) return;

    const delays = {
      'high': 500,
      'medium': 2000,
      'low': 5000
    };

    setTimeout(async () => {
      for (const componentName of strategy.components) {
        if (preloadedComponents.has(componentName)) continue;
        
        const importFunction = COMPONENT_IMPORTS[componentName];
        if (importFunction) {
          try {
            await preloadComponent(importFunction, componentName);
            setPreloadedComponents(prev => new Set([...prev, componentName]));
          } catch (error) {
            console.warn(`Falha ao precarregar componente ${componentName}:`, error);
          }
        }
      }

      for (const libraryName of strategy.libraries) {
        const importFunction = LIBRARY_IMPORTS[libraryName];
        if (importFunction && !ExternalLibraryLoader.isLoaded(libraryName)) {
          ExternalLibraryLoader.preloadLibrary(libraryName, importFunction);
        }
      }
    }, delays[strategy.priority]);
  }, [preloadedComponents]);

  const preloadFrequentComponents = useCallback(() => {
    const frequentComponents = ['MetricsChart', 'ContactsChart'];
    
    frequentComponents.forEach(componentName => {
      if (!preloadedComponents.has(componentName)) {
        const importFunction = COMPONENT_IMPORTS[componentName];
        if (importFunction) {
          preloadComponent(importFunction, componentName);
          setPreloadedComponents(prev => new Set([...prev, componentName]));
        }
      }
    });
  }, [preloadedComponents]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    preloadByRoute(currentPath);
    preloadByStrategy(currentPath);
    
    const sessionTimer = setTimeout(preloadFrequentComponents, 30000);
    
    return () => clearTimeout(sessionTimer);
  }, [location.pathname, preloadByRoute, preloadByStrategy, preloadFrequentComponents]);

  useEffect(() => {
    const requestIdleCallback = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(cb, 100));
    
    const idleHandle = requestIdleCallback(() => {
      if (!ExternalLibraryLoader.isLoaded('pdfjs-dist')) {
        ExternalLibraryLoader.preloadLibrary('pdfjs-dist', LIBRARY_IMPORTS['pdfjs-dist']);
      }
    });

    return () => {
      if ((window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
    };
  }, []);

  return {
    preloadedRoutes: Array.from(preloadedRoutes),
    preloadedComponents: Array.from(preloadedComponents),
    preloadComponent: (importFunction: () => Promise<any>, componentName: string) => {
      preloadComponent(importFunction, componentName);
      setPreloadedComponents(prev => new Set([...prev, componentName]));
    }
  };
}
