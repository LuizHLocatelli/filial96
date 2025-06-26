import { useEffect, useState } from 'react';
import { usePWANotifications } from '@/hooks/usePWANotifications';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Smartphone, CheckCircle, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PWANotificationPromptProps {
  forceShow?: boolean; // Para testes, mostrar mesmo se não for PWA
}

export function PWANotificationPrompt({ forceShow = false }: PWANotificationPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  const {
    permission,
    isSupported,
    requestPermission
  } = usePWANotifications();

  // Detectar se está rodando como PWA
  useEffect(() => {
    const detectPWA = () => {
      // Múltiplas formas de detectar PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const hasStandalone = 'standalone' in window.navigator;
      
      // Verificar se foi instalado
      const isInstalled = isStandalone || isIOSStandalone || isMinimalUI || isFullscreen;
      
      // Detectar se está no home screen (iOS)
      const isAddedToHomeScreen = (isIOSStandalone || isStandalone);
      
      const result = isInstalled || isAddedToHomeScreen || hasStandalone;
      
      console.log('🔍 PWA Detection Details:', {
        isStandalone,
        isIOSStandalone,
        isMinimalUI,
        isFullscreen,
        hasStandalone,
        isInstalled,
        isAddedToHomeScreen,
        finalResult: result,
        userAgent: navigator.userAgent.includes('Mobile'),
        forceShow
      });
      
      setIsPWA(result);
      return result;
    };

    const isPWAMode = detectPWA();

    // Verificar se deve mostrar o prompt
    const shouldShowPrompt = () => {
      // Se forceShow está ativo, sempre mostrar (para testes)
      if (forceShow && isSupported && permission === 'default') {
        return true;
      }

      // Só mostrar se for PWA E suportar notificações E não ter permissão ainda
      if (!isPWAMode || !isSupported || permission === 'granted' || permission === 'denied') {
        return false;
      }

      // Verificar se já foi mostrado hoje
      const lastShown = localStorage.getItem('pwa-notification-prompt-shown');
      const today = new Date().toDateString();
      
      if (lastShown === today) {
        return false;
      }

      // Verificar se tem lembrete agendado
      const remindAt = localStorage.getItem('pwa-notification-remind-at');
      if (remindAt) {
        const remindTime = new Date(remindAt);
        if (Date.now() < remindTime.getTime()) {
          return false; // Ainda não é hora de lembrar
        } else {
          // Chegou a hora, remover o lembrete
          localStorage.removeItem('pwa-notification-remind-at');
        }
      }

      return true;
    };

    if (shouldShowPrompt()) {
      setShouldShow(true);
      // Aguardar 2 segundos para a UI carregar completamente
      setTimeout(() => {
        setIsOpen(true);
      }, 2000);
    }
  }, [permission, isSupported, forceShow]);

  const handleAllow = async () => {
    try {
      const granted = await requestPermission();
      
      if (granted) {
        toast({
          title: "🎉 Notificações Ativadas!",
          description: "Agora você receberá alertas importantes como lembretes de depósito, novas tarefas e atualizações.",
          duration: 6000,
        });
        
        // Marcar como mostrado hoje
        localStorage.setItem('pwa-notification-prompt-shown', new Date().toDateString());
        localStorage.setItem('pwa-notifications-enabled', 'true');
        localStorage.removeItem('pwa-notifications-denied');
        localStorage.removeItem('pwa-notification-remind-at');
      } else {
        toast({
          title: "😔 Permissão Negada",
          description: "Você pode ativar as notificações depois nas configurações do perfil.",
          variant: "destructive",
          duration: 4000,
        });
        
        // Marcar como negado para não perturbar mais hoje
        localStorage.setItem('pwa-notification-prompt-shown', new Date().toDateString());
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível ativar as notificações. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
    
    setIsOpen(false);
  };

  const handleDeny = () => {
    // Marcar como mostrado hoje para não perturbar mais
    localStorage.setItem('pwa-notification-prompt-shown', new Date().toDateString());
    localStorage.setItem('pwa-notifications-denied', 'true');
    localStorage.removeItem('pwa-notification-remind-at');
    
    toast({
      title: "📱 Sem notificações",
      description: "Você pode ativar as notificações a qualquer momento nas configurações.",
      duration: 3000,
    });
    
    setIsOpen(false);
  };

  const handleRemindLater = () => {
    // Agendar para mostrar novamente em 1 hora
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
    localStorage.setItem('pwa-notification-remind-at', oneHourLater.toISOString());
    
    toast({
      title: "⏰ Lembrete agendado",
      description: "Vamos perguntar novamente em 1 hora.",
      duration: 3000,
    });
    
    setIsOpen(false);
  };

  // Se não deve mostrar, não renderizar nada
  if (!shouldShow || (!isPWA && !forceShow)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Bell className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-xl font-bold">
            🔔 Ativar Notificações?
          </DialogTitle>
          
          <DialogDescription className="text-center space-y-2">
            <p className="text-base">
              Para uma experiência completa, ative as notificações e receba:
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de benefícios */}
          <div className="space-y-3">
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 dark:text-green-200">Lembretes de Depósito</p>
                    <p className="text-green-600 dark:text-green-400">Alertas às 09:00 e 11:30</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Novas Tarefas</p>
                    <p className="text-blue-600 dark:text-blue-400">Orientações e prazos importantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200">Alertas Urgentes</p>
                    <p className="text-orange-600 dark:text-orange-400">Prazos e situações críticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões de ação */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleAllow} 
              className="w-full h-11 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Bell className="w-4 h-4 mr-2" />
              Sim, Ativar Notificações
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={handleRemindLater}
                size="sm"
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Lembrar em 1h
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleDeny}
                size="sm"
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Agora Não
              </Button>
            </div>
          </div>

          {/* Nota sobre privacidade */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            <p>🔒 Suas notificações ficam apenas no seu dispositivo</p>
            <p>Você pode desativar a qualquer momento nas configurações</p>
          </div>
          
          {forceShow && (
            <div className="text-xs text-orange-600 dark:text-orange-400 text-center bg-orange-50 dark:bg-orange-950 p-2 rounded">
              🧪 Modo de teste ativo - Aparece mesmo fora do PWA
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 