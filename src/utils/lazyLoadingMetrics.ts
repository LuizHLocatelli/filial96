/**
 * Metrics for lazy loading performance monitoring
 */

interface LoadingMetric {
  componentName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class LazyLoadingMetrics {
  private metrics: Map<string, LoadingMetric> = new Map();
  private enabled: boolean = false;

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  startLoading(componentName: string): void {
    if (!this.enabled) return;
    
    this.metrics.set(componentName, {
      componentName,
      startTime: performance.now(),
    });
  }

  endLoading(componentName: string): void {
    if (!this.enabled) return;
    
    const metric = this.metrics.get(componentName);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LazyLoad] ${componentName} loaded in ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  getMetrics(): LoadingMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetric(componentName: string): LoadingMetric | undefined {
    return this.metrics.get(componentName);
  }

  clear(): void {
    this.metrics.clear();
  }

  getStats() {
    const metrics = this.getMetrics().filter(m => m.duration !== undefined);
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration!);
    return {
      count: metrics.length,
      totalTime: durations.reduce((a, b) => a + b, 0),
      averageTime: durations.reduce((a, b) => a + b, 0) / metrics.length,
      maxTime: Math.max(...durations),
      minTime: Math.min(...durations),
    };
  }
}

export const lazyLoadingMetrics = new LazyLoadingMetrics();
