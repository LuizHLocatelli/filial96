import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Share, 
  MoreVertical,
  Plus,
  Globe,
  Monitor,
  Info,
  CheckCircle
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isIOSStandalone;
      
      setIsStandalone(isInstalled);
      setIsInstalled(isInstalled);
    };

    checkIfInstalled();

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        
        if (choice.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        } else {
          console.log('Usuário rejeitou a instalação');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Erro ao instalar PWA:', error);
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const getDeviceInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        device: 'iOS (Safari)',
        icon: <Globe className="h-6 w-6" />,
        steps: [
          'Abra este site no Safari',
          'Toque no botão de compartilhar (quadrado com seta para cima)',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" no canto superior direito'
        ]
      };
    }
    
    if (userAgent.includes('android')) {
      return {
        device: 'Android (Chrome)',
        icon: <Smartphone className="h-6 w-6" />,
        steps: [
          'Abra este site no Google Chrome',
          'Toque no menu (três pontos) no canto superior direito',
          'Selecione "Adicionar à tela inicial" ou "Instalar app"',
          'Confirme tocando em "Adicionar" ou "Instalar"'
        ]
      };
    }
    
    return {
      device: 'Desktop (Chrome/Edge)',
      icon: <Monitor className="h-6 w-6" />,
      steps: [
        'Abra este site no Chrome ou Edge',
        'Clique no ícone de instalação na barra de endereços',
        'Ou acesse o menu (três pontos) > "Instalar Filial 96"',
        'Confirme a instalação clicando em "Instalar"'
      ]
    };
  };

  const instructions = getDeviceInstructions();

  if (isInstalled) {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <CheckCircle className="h-4 w-4 text-green-600" />
        App Instalado
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleInstallClick}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {deferredPrompt ? 'Instalar App' : 'Como Instalar'}
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Como Instalar o App
            </DialogTitle>
            <DialogDescription>
              Instale o Filial 96 como um aplicativo no seu dispositivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {instructions.icon}
                  {instructions.device}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="space-y-3">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Badge variant="secondary" className="min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-medium">Benefícios do App Instalado:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Acesso mais rápido pela tela inicial</li>
                    <li>• Funciona mesmo sem internet</li>
                    <li>• Experiência de app nativo</li>
                    <li>• Notificações push (em breve)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setShowInstructions(false)}
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 