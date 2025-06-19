
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { Download, X, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function PWAInstallBanner() {
  const { installState } = usePWA();
  const isMobile = useIsMobile();
  const [showBanner, setShowBanner] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Mostrar banner após 3 segundos se o PWA não estiver instalado
    const timer = setTimeout(() => {
      if (!installState.isInstalled && !dismissed) {
        const lastDismissed = localStorage.getItem('pwa-banner-dismissed');
        const lastDismissedTime = lastDismissed ? parseInt(lastDismissed) : 0;
        const now = Date.now();
        
        // Mostrar novamente após 24 horas
        if (now - lastDismissedTime > 24 * 60 * 60 * 1000) {
          setShowBanner(true);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [installState.isInstalled, dismissed]);

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleInstallClick = () => {
    setShowInstallDialog(true);
    setShowBanner(false);
  };

  if (!showBanner || installState.isInstalled) {
    return (
      <>
        <PWAInstallPrompt 
          open={showInstallDialog} 
          onOpenChange={setShowInstallDialog} 
        />
      </>
    );
  }

  return (
    <>
      <div className={cn(
        "fixed bottom-20 left-4 right-4 z-40 animate-slide-up",
        isMobile ? "bottom-24" : "bottom-20"
      )}>
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Instalar Filial 96
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Acesse rapidamente e use offline
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Instalar
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PWAInstallPrompt 
        open={showInstallDialog} 
        onOpenChange={setShowInstallDialog} 
      />
    </>
  );
}
