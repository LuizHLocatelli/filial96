import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Clock, 
  Database, 
  Download, 
  Gauge, 
  Package, 
  RefreshCw, 
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useLazyLoadingStats } from '@/hooks/useIntelligentPreload';
import { lazyLoadingMetrics } from '@/utils/lazyLoadingMetrics';
import { componentCache, ExternalLibraryLoader } from '@/hooks/useLazyComponent';

interface LazyLoadingDashboardProps {
  className?: string;
}

export function LazyLoadingDashboard({ className }: LazyLoadingDashboardProps) {
  const stats = useLazyLoadingStats();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Só mostrar em desenvolvimento
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment) return;

    // Atalho de teclado para mostrar/esconder dashboard (Ctrl+Shift+L)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevelopment]);

  if (!isDevelopment || !isVisible) {
    return null;
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearMetrics = () => {
    lazyLoadingMetrics.clear();
    componentCache.clear();
    ExternalLibraryLoader.clear();
    setRefreshKey(prev => prev + 1);
  };

  const cacheStats = componentCache.getStats();
  const metrics = lazyLoadingMetrics.getMetrics();
  
  const performanceScore = stats.averageLoadTime > 0 
    ? Math.max(0, 100 - (stats.averageLoadTime / 50)) // 50ms = 100%, 5000ms = 0%
    : 100;

  return (
    <div className={`fixed top-4 right-4 z-[9999] max-w-md ${className}`}>
      <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Lazy Loading Dashboard
              </CardTitle>
              <CardDescription className="text-xs">
                Ctrl+Shift+L para alternar | Ambiente: Dev
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Performance Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Score de Performance
              </span>
              <Badge variant={performanceScore > 80 ? 'default' : performanceScore > 50 ? 'secondary' : 'destructive'}>
                {Math.round(performanceScore)}%
              </Badge>
            </div>
            <Progress value={performanceScore} className="h-2" />
          </div>

          <Separator />

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-3 w-3" />
                Componentes
              </div>
              <div className="font-mono text-lg">{stats.totalLoaded}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Tempo Médio
              </div>
              <div className="font-mono text-lg">{stats.averageLoadTime}ms</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Mais Rápido
              </div>
              <div className="font-mono text-lg text-green-600">{stats.fastestLoad}ms</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Mais Lento
              </div>
              <div className="font-mono text-lg text-orange-600">{stats.slowestLoad}ms</div>
            </div>
          </div>

          <Separator />

          {/* Cache Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              Status do Cache
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Cached:</span>
                <Badge variant="outline" className="text-xs">
                  {cacheStats.cached}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Loaded:</span>
                <Badge variant="outline" className="text-xs">
                  {cacheStats.loaded}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Componentes Recentes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4" />
              Carregados Recentemente
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metrics.slice(-5).reverse().map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                  <span className="truncate flex-1">{metric.componentName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{metric.loadTime?.toFixed(0)}ms</span>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  </div>
                </div>
              ))}
              {metrics.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhum componente carregado ainda
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMetrics}
              className="flex-1 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Limpar Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.table(metrics)}
              className="flex-1 text-xs"
            >
              Log Detalhado
            </Button>
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            💡 <strong>Dica:</strong> Tempos abaixo de 200ms são considerados excelentes para lazy loading.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 