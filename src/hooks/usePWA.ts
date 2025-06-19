
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  canInstall: boolean;
  isOffline: boolean;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    platform: 'unknown',
    canInstall: false,
    isOffline: false
  });

  useEffect(() => {
    // Detectar plataforma
    const detectPlatform = (): PWAInstallState['platform'] => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
      if (/android/.test(userAgent)) return 'android';
      if (/win|mac|linux/.test(userAgent)) return 'desktop';
      return 'unknown';
    };

    // Verificar se está em modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Verificar se já está instalado
    const isInstalled = isStandalone;

    // Status de conectividade
    const isOffline = !navigator.onLine;

    const platform = detectPlatform();

    setInstallState(prev => ({
      ...prev,
      isStandalone,
      isInstalled,
      platform,
      isOffline
    }));

    // Listener para o evento beforeinstallprompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setInstallState(prev => ({
        ...prev,
        isInstallable: true,
        canInstall: true
      }));
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setInstallState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        canInstall: false
      }));
    };

    // Listener para mudanças na conectividade
    const handleOnline = () => {
      setInstallState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setInstallState(prev => ({ ...prev, isOffline: true }));
    };

    // Registrar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration);
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log('Nova versão do Service Worker disponível');
            }
          });
        }
      });
    } catch (error) {
      console.error('Falha ao registrar Service Worker:', error);
    }
  };

  const installApp = async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
        setInstallPrompt(null);
        return true;
      } else {
        console.log('Usuário rejeitou instalar o PWA');
        return false;
      }
    } catch (error) {
      console.error('Erro ao tentar instalar PWA:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    switch (installState.platform) {
      case 'ios':
        return {
          title: 'Instalar no iPhone/iPad',
          steps: [
            'Toque no ícone de compartilhar na barra inferior do Safari',
            'Role para baixo e toque em "Adicionar à Tela de Início"',
            'Toque em "Adicionar" para confirmar'
          ]
        };
      case 'android':
        return {
          title: 'Instalar no Android',
          steps: [
            'Toque no menu (três pontos) no Chrome',
            'Selecione "Adicionar à tela inicial"',
            'Toque em "Adicionar" para confirmar'
          ]
        };
      case 'desktop':
        return {
          title: 'Instalar no Computador',
          steps: [
            'Clique no ícone de instalação na barra de endereços',
            'Ou clique no menu (três pontos) e selecione "Instalar"',
            'Confirme a instalação'
          ]
        };
      default:
        return {
          title: 'Instalar Aplicativo',
          steps: [
            'Procure pela opção de instalação no seu navegador',
            'Adicione à tela inicial ou instale como aplicativo'
          ]
        };
    }
  };

  return {
    installState,
    installApp,
    getInstallInstructions,
    updateAvailable: false // Para futuras implementações
  };
}
