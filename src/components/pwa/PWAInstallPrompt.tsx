
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { 
  Smartphone, 
  Download, 
  Monitor, 
  Share, 
  Plus, 
  X,
  Wifi,
  WifiOff,
  CheckCircle2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PWAInstallPrompt({ open, onOpenChange }: PWAInstallPromptProps) {
  const { installState, installApp, getInstallInstructions } = usePWA();
  const isMobile = useIsMobile();
  const [isInstalling, setIsInstalling] = useState(false);
  const instructions = getInstallInstructions();

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro na instalação:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const getPlatformIcon = () => {
    switch (installState.platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="h-6 w-6 text-green-600" />;
      case 'desktop':
        return <Monitor className="h-6 w-6 text-green-600" />;
      default:
        return <Download className="h-6 w-6 text-green-600" />;
    }
  };

  const getPlatformName = () => {
    switch (installState.platform) {
      case 'ios':
        return 'iOS (iPhone/iPad)';
      case 'android':
        return 'Android';
      case 'desktop':
        return 'Desktop';
      default:
        return 'Seu dispositivo';
    }
  };

  if (installState.isInstalled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("max-w-md", isMobile && "mx-4")}>
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">App Já Instalado!</DialogTitle>
            <DialogDescription className="text-center">
              O Filial 96 já está instalado em seu dispositivo e funcionando perfeitamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon()}
                  <div>
                    <p className="font-medium">Instalado em {getPlatformName()}</p>
                    <p className="text-sm text-muted-foreground">
                      Funcionando {installState.isOffline ? 'offline' : 'online'}
                    </p>
                  </div>
                  {installState.isOffline ? (
                    <WifiOff className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Wifi className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Continuar usando o app
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", isMobile && "mx-4")}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/c1732df3-8011-4da6-b0e5-c89f9ebf9bf1.png" 
                  alt="Filial 96"
                  className="w-8 h-8 rounded"
                />
              </div>
              <div>
                <DialogTitle className="text-lg">Instalar Filial 96</DialogTitle>
                <Badge variant="secondary" className="text-xs">
                  {getPlatformName()}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription>
            Instale o app para ter acesso rápido e funcionalidades offline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefícios */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Benefícios da instalação:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Acesso rápido pela tela inicial</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Funciona mesmo sem internet</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Interface otimizada para seu dispositivo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Notificações em tempo real</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Botão de instalação automática ou instruções */}
          {installState.canInstall ? (
            <Button 
              onClick={handleInstall} 
              disabled={isInstalling}
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              {isInstalling ? 'Instalando...' : 'Instalar Agora'}
            </Button>
          ) : (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  {installState.platform === 'ios' ? <Share className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {instructions.title}
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Agora não
            </Button>
            {!installState.canInstall && (
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Entendi
              </Button>
            )}
          </div>
        </div>

        {/* Status de conectividade */}
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
          {installState.isOffline ? (
            <>
              <WifiOff className="h-3 w-3 text-orange-500" />
              <span>Modo offline ativo</span>
            </>
          ) : (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Conectado</span>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
