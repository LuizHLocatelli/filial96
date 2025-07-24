import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CacheManager } from '@/utils/cacheManager';
import { toast } from '@/hooks/use-toast';
import { 
  Trash2, 
  RefreshCw, 
  Database, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle,
  Activity
} from 'lucide-react';

export function CacheDebugPanel() {
  const [cacheInfo, setCacheInfo] = useState<Array<{name: string, size: number}>>([]);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCacheInfo();
    checkServiceWorker();
  }, []);

  const loadCacheInfo = async () => {
    try {
      const info = await CacheManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Erro ao carregar info do cache:', error);
    }
  };

  const checkServiceWorker = async () => {
    const active = await CacheManager.isServiceWorkerActive();
    setIsServiceWorkerActive(active);
  };

  const handleClearAllCaches = async () => {
    setIsLoading(true);
    try {
      const success = await CacheManager.clearAllCaches();
      if (success) {
        toast({
          title: "✅ Caches Limpos",
          description: "Todos os caches foram removidos com sucesso",
        });
        await loadCacheInfo();
      } else {
        throw new Error('Falha ao limpar caches');
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível limpar os caches",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSupabaseCaches = async () => {
    setIsLoading(true);
    try {
      const success = await CacheManager.clearSupabaseCaches();
      if (success) {
        toast({
          title: "✅ Cache do Supabase Limpo",
          description: "Dados do Supabase serão recarregados do servidor",
        });
        await loadCacheInfo();
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível limpar cache do Supabase",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateServiceWorker = async () => {
    setIsLoading(true);
    try {
      const success = await CacheManager.updateServiceWorker();
      if (success) {
        toast({
          title: "🔄 Service Worker Atualizado",
          description: "A aplicação será recarregada em breve",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o service worker",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullReset = async () => {
    if (confirm('⚠️ Isso irá limpar TODOS os caches e recarregar a aplicação. Continuar?')) {
      toast({
        title: "🚀 Limpeza Completa Iniciada",
        description: "Limpando caches e recarregando...",
      });
      
      await CacheManager.performFullCacheReset();
    }
  };

  const totalCacheSize = cacheInfo.reduce((sum, cache) => sum + cache.size, 0);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Debug de Cache PWA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status do Service Worker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Service Worker</span>
          </div>
          <Badge variant={isServiceWorkerActive ? "default" : "destructive"}>
            {isServiceWorkerActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativo
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Inativo
              </>
            )}
          </Badge>
        </div>

        <Separator />

        {/* Informações dos Caches */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Caches Ativos ({totalCacheSize} itens)
          </h4>
          
          {cacheInfo.length > 0 ? (
            <div className="space-y-2">
              {cacheInfo.map((cache) => (
                <div key={cache.name} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {cache.name}
                  </span>
                  <Badge variant="outline">
                    {cache.size} itens
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum cache encontrado</p>
          )}
        </div>

        <Separator />

        {/* Ações de Limpeza */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Ações de Limpeza</h4>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSupabaseCaches}
              disabled={isLoading}
              className="justify-start"
            >
              <Database className="w-4 h-4 mr-2" />
              Limpar Cache do Supabase
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateServiceWorker}
              disabled={isLoading}
              className="justify-start"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Service Worker
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllCaches}
              disabled={isLoading}
              className="justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Caches
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleFullReset}
              disabled={isLoading}
              className="justify-start"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reset Completo + Reload
            </Button>
          </div>
        </div>

        {/* Avisos */}
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="text-xs text-orange-800 dark:text-orange-200">
              <p className="font-medium mb-1">Sobre o Cache PWA:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>O cache é necessário para funcionamento offline</li>
                <li>Limpar cache pode causar perda temporária de dados offline</li>
                <li>Reset completo força recarregamento de todos os recursos</li>
                <li>Use apenas se houver problemas de atualização</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}