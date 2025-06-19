
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
      console.log('PWA: User Agent:', userAgent);
      
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

    console.log('PWA: Platform detected:', platform);
    console.log('PWA: Is standalone:', isStandalone);
    console.log('PWA: Is installed:', isInstalled);

    setInstallState(prev => ({
      ...prev,
      isStandalone,
      isInstalled,
      platform,
      isOffline
    }));

    // Verificar se o evento beforeinstallprompt já foi disparado
    const checkExistingPrompt = () => {
      // @ts-ignore - Verificar se já existe um prompt em cache
      if (window.deferredPrompt) {
        console.log('PWA: Found existing deferred prompt');
        setInstallPrompt(window.deferredPrompt);
        setInstallState(prev => ({
          ...prev,
          isInstallable: true,
          canInstall: true
        }));
      }
    };

    // Listener para o evento beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired!', e);
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      
      // @ts-ignore - Armazenar globalmente para debug
      window.deferredPrompt = promptEvent;
      
      setInstallPrompt(promptEvent);
      setInstallState(prev => ({
        ...prev,
        isInstallable: true,
        canInstall: true
      }));
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = (e: Event) => {
      console.log('PWA: App installed successfully', e);
      // @ts-ignore
      window.deferredPrompt = null;
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

    // Verificar prompt existente
    checkExistingPrompt();

    // Para iOS, verificar se pode ser instalado
    if (platform === 'ios') {
      const isIOSInstallable = !isStandalone && 
                              /safari/i.test(navigator.userAgent) && 
                              !/chrome|crios|fxios/i.test(navigator.userAgent);
      
      console.log('PWA: iOS installable:', isIOSInstallable);
      
      setInstallState(prev => ({
        ...prev,
        isInstallable: isIOSInstallable,
        canInstall: false // iOS não suporta prompt automático
      }));
    }

    // Para Android Chrome, verificar se o prompt ainda não foi disparado
    if (platform === 'android' && !isInstalled) {
      // Aguardar um pouco para o evento ser disparado
      const timeout = setTimeout(() => {
        if (!installPrompt) {
          console.log('PWA: No beforeinstallprompt event detected on Android Chrome');
          console.log('PWA: Checking PWA criteria...');
          
          // Verificar se atende os critérios básicos de PWA
          const hasSW = 'serviceWorker' in navigator;
          const hasManifest = document.querySelector('link[rel="manifest"]');
          const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
          
          console.log('PWA: Has Service Worker support:', hasSW);
          console.log('PWA: Has manifest:', !!hasManifest);
          console.log('PWA: Is HTTPS:', isHTTPS);
          
          if (hasSW && hasManifest && isHTTPS) {
            console.log('PWA: Meets PWA criteria but no install prompt available');
            setInstallState(prev => ({
              ...prev,
              isInstallable: true,
              canInstall: false // Fallback para instruções manuais
            }));
          }
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }

    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Log para debug
    console.log('PWA: Initial state', { 
      platform, 
      isStandalone, 
      isInstalled, 
      userAgent: navigator.userAgent 
    });

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
      console.log('PWA: Service Worker registered successfully:', registration);
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: New version available');
            }
          });
        }
      });
    } catch (error) {
      console.error('PWA: Failed to register Service Worker:', error);
    }
  };

  const installApp = async (): Promise<boolean> => {
    console.log('PWA: Install app called, prompt available:', !!installPrompt);
    
    if (!installPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      console.log('PWA: Showing install prompt...');
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      console.log('PWA: User choice:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted installation');
        // @ts-ignore
        window.deferredPrompt = null;
        setInstallPrompt(null);
        setInstallState(prev => ({
          ...prev,
          canInstall: false
        }));
        return true;
      } else {
        console.log('PWA: User dismissed installation');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error during installation:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    switch (installState.platform) {
      case 'ios':
        return {
          title: 'Instalar no iPhone/iPad',
          steps: [
            'Toque no ícone de compartilhar (📤) na barra inferior do Safari',
            'Role para baixo e toque em "Adicionar à Tela de Início"',
            'Toque em "Adicionar" para confirmar a instalação'
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
