import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NetworkStatusIndicator = () => {
  const { isOnline, isSlowConnection, connectionType, lastOnlineTime } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null; // Não mostra nada quando está online normal
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md">
      <Alert className={`border-2 ${isOnline ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Zap className="h-4 w-4 text-yellow-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          
          <div className="flex-1">
            <AlertDescription>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {isOnline ? 'Conexão Lenta' : 'Modo Offline'}
                </span>
                
                <div className="flex items-center gap-2">
                  {connectionType !== 'unknown' && (
                    <Badge variant="secondary" className="text-xs">
                      {connectionType.toUpperCase()}
                    </Badge>
                  )}
                  
                  {!isOnline && (
                    <Badge variant="outline" className="text-xs">
                      <Wifi className="h-3 w-3 mr-1" />
                      OFFLINE
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-1">
                {isOnline && isSlowConnection && (
                  'Funcionalidades podem estar limitadas'
                )}
                {!isOnline && (
                  <>
                    Dados salvos localmente serão sincronizados quando voltar online
                    {lastOnlineTime && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          Última conexão: {formatDistanceToNow(lastOnlineTime, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}; 