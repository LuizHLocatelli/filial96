
/**
 * Utilitários para monitorar performance do lazy loading
 */

interface LoadingMetric {
  componentName: string;
  startTime: number;
  endTime?: number;
  loadTime?: number;
}

class LazyLoadingMetrics {
  private metrics: Map<string, LoadingMetric> = new Map();
  
  startLoading(componentName: string) {
    this.metrics.set(componentName, {
      componentName,
      startTime: performance.now()
    });
  }
  
  endLoading(componentName: string) {
    const metric = this.metrics.get(componentName);
    if (metric) {
      const endTime = performance.now();
      const loadTime = endTime - metric.startTime;
      
      this.metrics.set(componentName, {
        ...metric,
        endTime,
        loadTime
      });
      
      // Log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Lazy Loading: ${componentName} carregado em ${loadTime.toFixed(2)}ms`);
      }
    }
  }
  
  getMetrics() {
    return Array.from(this.metrics.values()).filter(m => m.loadTime !== undefined);
  }
  
  getAverageLoadTime() {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + (metric.loadTime || 0), 0);
    return total / metrics.length;
  }
  
  clear() {
    this.metrics.clear();
  }
}

export const lazyLoadingMetrics = new LazyLoadingMetrics();

// Hook para usar métricas de lazy loading
export function useLazyLoadingMetrics(componentName: string) {
  const startLoading = () => lazyLoadingMetrics.startLoading(componentName);
  const endLoading = () => lazyLoadingMetrics.endLoading(componentName);
  
  return { startLoading, endLoading };
}
