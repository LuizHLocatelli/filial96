
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const isMobile = useIsMobile();

  // Detectar se já está instalado
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkIfInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkIfInstalled);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkIfInstalled);
    };
  }, []);

  // Capturar evento beforeinstallprompt (Chrome/Edge)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 3 segundos se não estiver instalado
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  // Detectar iOS Safari para mostrar instruções específicas
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isInstalled) {
      setTimeout(() => {
        setShowIOSInstructions(true);
      }, 5000);
    }
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const dismissIOSInstructions = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('ios-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const iosDismissed = localStorage.getItem('ios-install-dismissed');
    
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneWeek) {
        setShowInstallPrompt(false);
      }
    }

    if (iosDismissed) {
      const dismissedTime = parseInt(iosDismissed);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneWeek) {
        setShowIOSInstructions(false);
      }
    }
  }, []);

  if (isInstalled) return null;

  return (
    <>
      {/* Prompt para Android/Chrome */}
      <AnimatePresence>
        {showInstallPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          >
            <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <img 
                        src="/lovable-uploads/220efd77-c866-404d-97db-eb83999f4e52.png" 
                        alt="Filial 96" 
                        className="w-8 h-8"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-primary">Instalar Filial 96</CardTitle>
                      <CardDescription className="text-sm">
                        Acesso rápido direto na tela inicial
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissPrompt}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstallClick}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Instalar App
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={dismissPrompt}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Agora não
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruções para iOS */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          >
            <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Smartphone className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-600">Instalar no iPhone</CardTitle>
                      <CardDescription className="text-sm">
                        Adicione à tela inicial para melhor experiência
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissIOSInstructions}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="text-sm space-y-2">
                  <p className="font-medium">Para instalar no iOS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Toque no botão de compartilhar (quadrado com seta)</li>
                    <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                    <li>Toque em "Adicionar" para confirmar</li>
                  </ol>
                </div>
                <Button 
                  variant="outline" 
                  onClick={dismissIOSInstructions}
                  className="w-full border-blue-300 hover:bg-blue-50"
                >
                  Entendi
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
