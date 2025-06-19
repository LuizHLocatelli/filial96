
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
  CheckCircle2,
  Zap,
  AlertCircle,
  Clock
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
  const [showDebug, setShowDebug] = useState(false);
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
            <DialogTitle className="text-xl">App Já Instalado! 🎉</DialogTitle>
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
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getPlatformName()}
                  </Badge>
                  {installState.canInstall ? (
                    <Badge className="text-xs bg-green-600 hover:bg-green-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Instalação Rápida
                    </Badge>
                  ) : installState.promptExpired ? (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Prompt Expirado
                    </Badge>
                  ) : installState.platform === 'android' ? (
                    <Badge variant="outline" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Instalação Manual
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <DialogDescription>
            {installState.canInstall 
              ? "Clique no botão abaixo para instalar o app diretamente!" 
              : installState.promptExpired
              ? "A opção de instalação rápida expirou. Recarregue a página para uma nova oportunidade ou use as instruções manuais abaixo."
              : installState.platform === 'android'
              ? "Seu navegador Chrome não está oferecendo instalação automática. Use as instruções manuais abaixo."
              : "Siga as instruções para adicionar o app à sua tela inicial."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aviso sobre prompt expirado */}
          {installState.promptExpired && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Instalação rápida expirou
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      O navegador removeu a opção de instalação automática após um tempo. 
                      Recarregue a página para uma nova oportunidade ou use a instalação manual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug info para Android sem install prompt */}
          {installState.platform === 'android' && !installState.canInstall && !installState.promptExpired && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Instalação automática não disponível
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      O Chrome pode não estar oferecendo a instalação automática por critérios internos. 
                      Use a instalação manual abaixo.
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-orange-600 hover:text-orange-800"
                      onClick={() => setShowDebug(!showDebug)}
                    >
                      {showDebug ? 'Ocultar' : 'Ver'} detalhes técnicos
                    </Button>
                    {showDebug && (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-mono">
                        <p>• Service Worker: ✓</p>
                        <p>• Manifest: ✓</p>
                        <p>• HTTPS: ✓</p>
                        <p>• beforeinstallprompt: ✗</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefícios */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                Benefícios da instalação:
              </h4>
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

          {/* Botão de instalação automática */}
          {installState.canInstall ? (
            <div className="space-y-3">
              <Button 
                onClick={handleInstall} 
                disabled={isInstalling}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {isInstalling ? 'Instalando...' : '+ Instalar no ' + getPlatformName()}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Instalação automática disponível para seu navegador
              </p>
            </div>
          ) : (
            /* Instruções manuais */
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  {installState.platform === 'ios' ? <Share className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {instructions.title}
                </h4>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="flex-1">{step}</span>
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
              <Button onClick={() => onOpenChange(false)} className="flex-1 bg-green-600 hover:bg-green-700">
                Entendi
              </Button>
            )}
          </div>

          {/* Dica para recarregar se o prompt expirou */}
          {installState.promptExpired && (
            <div className="text-center">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-orange-600 hover:text-orange-800"
              >
                🔄 Recarregar página para nova oportunidade
              </Button>
            </div>
          )}
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
