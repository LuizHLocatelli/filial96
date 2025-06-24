import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadComponent, componentCache, ExternalLibraryLoader } from './useLazyComponent';
import { lazyLoadingMetrics } from '@/utils/lazyLoadingMetrics';

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

// Mapeamento de rotas mais prováveis de serem visitadas
const ROUTE_PATTERNS: RoutePattern[] = [
  { from: '/', to: '/crediario', probability: 0.7, preloadDelay: 2000 },
  { from: '/', to: '/moveis', probability: 0.6, preloadDelay: 3000 },
  { from: '/crediario', to: '/depositos', probability: 0.8, preloadDelay: 1000 },
  { from: '/moveis', to: '/orientacoes', probability: 0.7, preloadDelay: 1500 },
  { from: '/moda', to: '/reservas', probability: 0.6, preloadDelay: 2000 },
  { from: '/', to: '/cards-promocionais', probability: 0.4, preloadDelay: 5000 },
];

// Estratégias de preload por rota
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
    components: ['OrientacoesList', 'PDFExportDialog'],
    libraries: ['jspdf', 'recharts'],
    priority: 'medium'
  },
  {
    route: '/moda',
    components: ['ReservaCard', 'PDFExportDialog'],
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

// Componentes mapeados para import functions
const COMPONENT_IMPORTS: Record<string, () => Promise<any>> = {
  'Crediario': () => import('../pages/Crediario'),
  'Moveis': () => import('../pages/Moveis'),
  'Moda': () => import('../pages/Moda'),
  'MetricsChart': () => import('../components/crediario/clientes/dashboard/MetricsChart'),
  'ContactsChart': () => import('../components/crediario/clientes/dashboard/ContactsChart'),
  'DepositFormDialog': () => import('../components/crediario/depositos/DepositFormDialog'),
  'ClienteFormDialog': () => import('../components/crediario/components/ClienteFormDialog'),
  'OrientacoesList': () => import('../components/moveis/orientacoes/OrientacoesList'),
  'PDFExportDialog': () => import('../components/moveis/rotinas/components/PDFExportDialog'),
  'ReservaCard': () => import('../components/moda/reservas/components/ReservaCard'),
  'UploadCardDialog': () => import('../components/promotional-cards/UploadCardDialog'),
  'CardEditDialog': () => import('../components/promotional-cards/CardEditDialog'),
};

// Bibliotecas mapeadas para import functions
const LIBRARY_IMPORTS: Record<string, () => Promise<any>> = {
  'recharts': () => import('recharts'),
  'jspdf': () => import('jspdf'),
  'date-fns': () => import('date-fns'),
  'pdfjs-dist': () => import('pdfjs-dist'),
};

// Analytics de navegação para otimizar preload
class NavigationAnalytics {
  private static instance: NavigationAnalytics;
  private routeTransitions: Map<string, Map<string, number>> = new Map();
  private visitCounts: Map<string, number> = new Map();
  private sessionStartTime = Date.now();

  static getInstance(): NavigationAnalytics {
    if (!NavigationAnalytics.instance) {
      NavigationAnalytics.instance = new NavigationAnalytics();
    }
    return NavigationAnalytics.instance;
  }

  recordTransition(from: string, to: string): void {
    if (!this.routeTransitions.has(from)) {
      this.routeTransitions.set(from, new Map());
    }
    
    const transitions = this.routeTransitions.get(from)!;
    transitions.set(to, (transitions.get(to) || 0) + 1);
    
    this.visitCounts.set(to, (this.visitCounts.get(to) || 0) + 1);
  }

  getTransitionProbability(from: string, to: string): number {
    const transitions = this.routeTransitions.get(from);
    if (!transitions) return 0;

    const totalTransitions = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
    const toTransitions = transitions.get(to) || 0;
    
    return totalTransitions > 0 ? toTransitions / totalTransitions : 0;
  }

  getMostLikelyNextRoutes(from: string, limit: number = 3): string[] {
    const transitions = this.routeTransitions.get(from);
    if (!transitions) return [];

    return Array.from(transitions.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([route]) => route);
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  getVisitCount(route: string): number {
    return this.visitCounts.get(route) || 0;
  }
}

export function useIntelligentPreload() {
  const location = useLocation();
  const [analytics] = useState(() => NavigationAnalytics.getInstance());
  const [preloadedRoutes, setPreloadedRoutes] = useState(new Set<string>());
  const [preloadedComponents, setPreloadedComponents] = useState(new Set<string>());

  // Registrar transições de rota
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Armazenar rota anterior no sessionStorage
    const previousPath = sessionStorage.getItem('previousRoute');
    if (previousPath && previousPath !== currentPath) {
      analytics.recordTransition(previousPath, currentPath);
    }
    
    sessionStorage.setItem('previousRoute', currentPath);
  }, [location.pathname, analytics]);

  // Preload baseado em padrões de rota
  const preloadByRoute = useCallback(async (currentPath: string) => {
    const relevantPatterns = ROUTE_PATTERNS.filter(pattern => pattern.from === currentPath);
    
    for (const pattern of relevantPatterns) {
      if (preloadedRoutes.has(pattern.to)) continue;

      const actualProbability = analytics.getTransitionProbability(pattern.from, pattern.to);
      const effectiveProbability = Math.max(pattern.probability, actualProbability);
      
      if (effectiveProbability > 0.3) {
        setTimeout(() => {
          if (COMPONENT_IMPORTS[pattern.to.slice(1)]) {
            preloadComponent(COMPONENT_IMPORTS[pattern.to.slice(1)], pattern.to);
            setPreloadedRoutes(prev => new Set([...prev, pattern.to]));
          }
        }, pattern.preloadDelay || 2000);
      }
    }
  }, [analytics, preloadedRoutes]);

  // Preload baseado em estratégias de rota
  const preloadByStrategy = useCallback(async (currentPath: string) => {
    const strategy = PRELOAD_STRATEGIES.find(s => s.route === currentPath);
    if (!strategy) return;

    const delays = {
      'high': 500,
      'medium': 2000,
      'low': 5000
    };

    setTimeout(async () => {
      // Preload componentes
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

      // Preload bibliotecas
      for (const libraryName of strategy.libraries) {
        const importFunction = LIBRARY_IMPORTS[libraryName];
        if (importFunction && !ExternalLibraryLoader.isLoaded(libraryName)) {
          ExternalLibraryLoader.preloadLibrary(libraryName, importFunction);
        }
      }
    }, delays[strategy.priority]);
  }, [preloadedComponents]);

  // Preload com base no tempo de sessão
  const preloadBySessionTime = useCallback(() => {
    const sessionDuration = analytics.getSessionDuration();
    
    // Após 30 segundos, preload componentes frequentemente usados
    if (sessionDuration > 30000) {
      const frequentComponents = ['MetricsChart', 'ContactsChart', 'OrientacoesList'];
      
      frequentComponents.forEach(componentName => {
        if (!preloadedComponents.has(componentName)) {
          const importFunction = COMPONENT_IMPORTS[componentName];
          if (importFunction) {
            preloadComponent(importFunction, componentName);
            setPreloadedComponents(prev => new Set([...prev, componentName]));
          }
        }
      });
    }
  }, [analytics, preloadedComponents]);

  // Executar estratégias de preload
  useEffect(() => {
    const currentPath = location.pathname;
    
    preloadByRoute(currentPath);
    preloadByStrategy(currentPath);
    
    // Timer para preload baseado em tempo de sessão
    const sessionTimer = setTimeout(preloadBySessionTime, 30000);
    
    return () => clearTimeout(sessionTimer);
  }, [location.pathname, preloadByRoute, preloadByStrategy, preloadBySessionTime]);

  // Preload quando idle
  useEffect(() => {
    const requestIdleCallback = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(cb, 100));
    
    const idleHandle = requestIdleCallback(() => {
      // Durante idle time, preload bibliotecas pesadas
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
    analytics,
    preloadedRoutes: Array.from(preloadedRoutes),
    preloadedComponents: Array.from(preloadedComponents),
    preloadComponent: (importFunction: () => Promise<any>, componentName: string) => {
      preloadComponent(importFunction, componentName);
      setPreloadedComponents(prev => new Set([...prev, componentName]));
    },
    getStats: () => ({
      routes: preloadedRoutes.size,
      components: preloadedComponents.size,
      libraries: Object.keys(LIBRARY_IMPORTS).filter(lib => ExternalLibraryLoader.isLoaded(lib)).length,
      cache: componentCache.getStats(),
      metrics: lazyLoadingMetrics.getMetrics()
    })
  };
}

// Hook para métricas de performance
export function useLazyLoadingStats() {
  const [stats, setStats] = useState({
    totalLoaded: 0,
    averageLoadTime: 0,
    fastestLoad: 0,
    slowestLoad: 0,
    failedLoads: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const metrics = lazyLoadingMetrics.getMetrics();
      
      if (metrics.length > 0) {
        const loadTimes = metrics.map(m => m.loadTime || 0);
        const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
        
        setStats({
          totalLoaded: metrics.length,
          averageLoadTime: Math.round(averageLoadTime),
          fastestLoad: Math.round(Math.min(...loadTimes)),
          slowestLoad: Math.round(Math.max(...loadTimes)),
          failedLoads: 0 // Pode ser implementado no futuro
        });
      }
    };

    // Atualizar stats a cada 5 segundos
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Execução inicial

    return () => clearInterval(interval);
  }, []);

  return stats;
} 