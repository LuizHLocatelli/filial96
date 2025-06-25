import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff, RefreshCw, Home, Clock, Database } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OfflinePage = () => {
  const { isOnline, lastOnlineTime } = useNetworkStatus();
  const navigate = useNavigate();

  const handleRefresh = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const cachedPages = [
    { name: 'Página Inicial', path: '/', status: 'cached' },
    { name: 'Móveis', path: '/moveis', status: 'cached' },
    { name: 'Moda', path: '/moda', status: 'cached' },
    { name: 'Crediário', path: '/crediario', status: 'cached' },
    { name: 'Hub Produtividade', path: '/hub-produtividade', status: 'cached' },
    { name: 'Perfil', path: '/profile', status: 'cached' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Status Card */}
        <Card className="border-2 border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <WifiOff className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700 dark:text-red-400">
              Você está offline
            </CardTitle>
            <CardDescription className="text-lg">
              Não foi possível carregar esta página sem conexão com a internet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastOnlineTime && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Última conexão: {formatDistanceToNow(lastOnlineTime, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleRefresh} 
                disabled={!isOnline}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isOnline ? 'Tentar Novamente' : 'Sem Conexão'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Ir para Início
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Pages Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Páginas Disponíveis Offline
            </CardTitle>
            <CardDescription>
              Estas páginas estão salvas no seu dispositivo e funcionam sem internet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {cachedPages.map((page) => (
                <div 
                  key={page.path}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(page.path)}
                >
                  <span className="font-medium">{page.name}</span>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <Database className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Dicas para usar offline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Dados salvos:</strong> Suas informações ficam seguras e serão sincronizadas quando voltar online</p>
              <p>• <strong>Funcionalidades:</strong> Você pode visualizar dados já carregados e fazer alterações que serão enviadas depois</p>
              <p>• <strong>Notificações:</strong> O app vai avisar quando a conexão voltar e sincronizar automaticamente</p>
              <p>• <strong>Instalação:</strong> Instale o app no seu dispositivo para melhor experiência offline</p>
            </div>
          </CardContent>
        </Card>

        {isOnline && (
          <div className="text-center">
            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              🌐 Conexão restaurada! Você já pode navegar normalmente.
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}; 