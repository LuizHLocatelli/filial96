import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Monitor, X, CheckCircle, Wifi, Database, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPWAButton = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detectar se já está instalado
    const checkIfInstalled = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSInstalled = isIOS && (window.navigator as any).standalone;
      
      setIsInstalled(isInStandaloneMode || isIOSInstalled);
    };

    // Listener para o evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      console.log('🔄 PWA pode ser instalado!');
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('✅ PWA instalado com sucesso!');
    };

    checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    setIsInstalling(true);
    setShowInstallDialog(false);

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuário aceitou a instalação');
      } else {
        console.log('❌ Usuário rejeitou a instalação');
      }
    } catch (error) {
      console.error('❌ Erro durante instalação:', error);
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
    }
  };

  // Não mostrar se já está instalado
  if (isInstalled) {
    return null;
  }

  // Não mostrar se não pode instalar
  if (!installPrompt) {
    return null;
  }

  const benefits = [
    {
      icon: <Smartphone className="h-5 w-5 text-blue-600" />,
      title: 'Acesso Rápido',
      description: 'Abra direto da tela inicial do seu dispositivo'
    },
    {
      icon: <Database className="h-5 w-5 text-green-600" />,
      title: 'Funciona Offline',
      description: 'Use mesmo sem conexão com a internet'
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      title: 'Performance',
      description: 'Carregamento mais rápido e fluido'
    },
    {
      icon: <Wifi className="h-5 w-5 text-purple-600" />,
      title: 'Sincronização',
      description: 'Dados sincronizados automaticamente'
    }
  ];

  return (
    <>
      {/* Botão de instalação */}
      <Button
        onClick={() => setShowInstallDialog(true)}
        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="sm"
      >
        <Download className="h-4 w-4" />
        Instalar App
      </Button>

      {/* Dialog de instalação */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Instalar Filial 96</DialogTitle>
                  <DialogDescription>
                    Tenha acesso rápido e funcionalidades offline
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInstallDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview do ícone */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">96</span>
                </div>
                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white">
                  PWA
                </Badge>
              </div>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {benefit.icon}
                      <CardTitle className="text-sm">{benefit.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Passos da instalação */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Como funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Clique em "Instalar Agora"</p>
                  <p>2. Confirme a instalação no popup</p>
                  <p>3. O app aparecerá na sua tela inicial</p>
                  <p>4. Pronto! Use como um app nativo</p>
                </div>
              </CardContent>
            </Card>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 gap-2"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Instalando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Instalar Agora
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowInstallDialog(false)}
                className="px-6"
              >
                Depois
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Gratuito • Sem anúncios • Funciona offline
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 