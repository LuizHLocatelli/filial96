import { PWANotificationPrompt } from '@/components/pwa/PWANotificationPrompt';
import { NotificationManager } from '@/components/pwa/NotificationManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWANotifications } from '@/hooks/usePWANotifications';
import { Bell, Smartphone, Monitor, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PWANotificationTest() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  
  const { permission, isSupported } = usePWANotifications();

  useEffect(() => {
    // Detectar informações do dispositivo
    const detectDevice = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMobile = window.navigator.userAgent.includes('Mobile');
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      const isPWAMode = isStandalone || isIOSStandalone || isMinimalUI || isFullscreen;
      
      setIsPWA(isPWAMode);
      setDeviceInfo({
        isStandalone,
        isIOSStandalone,
        isMinimalUI,
        isFullscreen,
        isMobile,
        isIOS,
        isAndroid,
        isPWAMode,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`
      });
    };

    detectDevice();
    
    // Detectar mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(detectDevice);
    
    return () => mediaQuery.removeListener(detectDevice);
  }, []);

  const clearAllSettings = () => {
    localStorage.removeItem('pwa-notification-prompt-shown');
    localStorage.removeItem('pwa-notifications-enabled');
    localStorage.removeItem('pwa-notifications-denied');
    localStorage.removeItem('pwa-notification-remind-at');
    
    window.location.reload();
  };

  const getPermissionColor = (perm: string) => {
    switch (perm) {
      case 'granted': return 'bg-green-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-orange-500';
    }
  };

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">🧪 Teste do Sistema de Notificações PWA</h1>
        <p className="text-muted-foreground">Validação completa do prompt de notificações</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Status PWA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">PWA Mode:</span>
                <Badge variant={isPWA ? "default" : "secondary"}>
                  {isPWA ? "✅ Ativo" : "❌ Inativo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Device:</span>
                <Badge variant="outline">
                  {deviceInfo.isMobile ? "📱 Mobile" : "💻 Desktop"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Suporte:</span>
                <Badge variant={isSupported ? "default" : "destructive"}>
                  {isSupported ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Permissão:</span>
                <Badge className={`text-white ${getPermissionColor(permission)}`}>
                  {permission === 'granted' ? '✅ Concedida' : 
                   permission === 'denied' ? '❌ Negada' : 
                   '⏳ Pendente'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Prompt mostrado:</span>
                <Badge variant={localStorage.getItem('pwa-notification-prompt-shown') ? "default" : "outline"}>
                  {localStorage.getItem('pwa-notification-prompt-shown') ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Detalhes Técnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p><strong>Standalone:</strong> {deviceInfo.isStandalone ? "✅" : "❌"}</p>
              <p><strong>iOS Standalone:</strong> {deviceInfo.isIOSStandalone ? "✅" : "❌"}</p>
              <p><strong>Minimal UI:</strong> {deviceInfo.isMinimalUI ? "✅" : "❌"}</p>
              <p><strong>Fullscreen:</strong> {deviceInfo.isFullscreen ? "✅" : "❌"}</p>
            </div>
            <div>
              <p><strong>iOS:</strong> {deviceInfo.isIOS ? "✅" : "❌"}</p>
              <p><strong>Android:</strong> {deviceInfo.isAndroid ? "✅" : "❌"}</p>
              <p><strong>Screen:</strong> {deviceInfo.screenSize}</p>
              <p><strong>Window:</strong> {deviceInfo.windowSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de teste */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🧪 Testes Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setShowPrompt(!showPrompt)} 
              className="w-full"
              variant={showPrompt ? "destructive" : "default"}
            >
              {showPrompt ? "❌ Esconder Prompt" : "🔔 Mostrar Prompt (Forçado)"}
            </Button>
            
            <Button 
              onClick={clearAllSettings} 
              variant="outline" 
              className="w-full"
            >
              🗑️ Limpar Todas as Configurações
            </Button>
          </CardContent>
        </Card>

        {/* NotificationManager para testes avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">⚙️ Gerenciador de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationManager showTestMode={true} />
          </CardContent>
        </Card>
      </div>

      {/* Prompt de teste */}
      {showPrompt && <PWANotificationPrompt forceShow={true} />}
    </div>
  );
} 