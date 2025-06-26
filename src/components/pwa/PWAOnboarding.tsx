import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Wifi, 
  Download, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

interface PWAOnboardingProps {
  show?: boolean;
  onComplete?: () => void;
}

export const PWAOnboarding = ({ show = false, onComplete }: PWAOnboardingProps) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Filial 96 PWA!',
      description: 'Descubra as funcionalidades que tornam sua experiência ainda melhor',
      icon: <Smartphone className="h-8 w-8" />,
      color: 'blue',
      features: [
        'Interface mais rápida e fluida',
        'Funciona mesmo sem internet',
        'Instalável como app nativo',
        'Sincronização automática'
      ]
    },
    {
      id: 'offline',
      title: 'Funciona Offline',
      description: 'Continue trabalhando mesmo sem conexão com a internet',
      icon: <Wifi className="h-8 w-8" />,
      color: 'green',
      features: [
        'Dados salvos localmente',
        'Sincronização quando voltar online',
        'Todas as páginas principais disponíveis',
        'Formulários salvos automaticamente'
      ]
    },
    {
      id: 'install',
      title: 'App Instalado com Sucesso!',
      description: 'Agora você tem acesso rápido direto da tela inicial',
      icon: <Download className="h-8 w-8" />,
      color: 'purple',
      features: [
        'Ícone na tela inicial do seu dispositivo',
        'Abre sem precisar do navegador',
        'Notificações push (em breve)',
        'Experiência de app nativo completa'
      ]
    },
    {
      id: 'performance',
      title: 'Performance Otimizada',
      description: 'Carregamento mais rápido e melhor experiência de uso',
      icon: <Zap className="h-8 w-8" />,
      color: 'yellow',
      features: [
        'Cache inteligente ativo',
        'Carregamento instantâneo',
        'Menos consumo de dados',
        'Interface mais responsiva'
      ]
    }
  ];

  useEffect(() => {
    // Verificar se já está em modo standalone (PWA instalado)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isPWAInstalled = isStandaloneMode || isIOSStandalone;

    // Só mostrar se:
    // 1. Foi solicitado explicitamente (show=true) OU
    // 2. PWA foi recém-instalado e usuário não viu onboarding ainda
    if (show || (isPWAInstalled && !localStorage.getItem('pwa_onboarding_completed'))) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleComplete = () => {
    localStorage.setItem('pwa_onboarding_completed', 'true');
    setShowOnboarding(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('pwa_onboarding_completed', 'true');
    setShowOnboarding(false);
    onComplete?.();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 text-white',
      green: 'from-green-500 to-green-600 text-white',
      purple: 'from-purple-500 to-purple-600 text-white',
      yellow: 'from-yellow-500 to-yellow-600 text-white'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Dialog open={showOnboarding} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              {currentStep + 1} de {steps.length}
            </Badge>
            <DialogTitle className="text-2xl">{currentStepData.title}</DialogTitle>
            <DialogDescription className="text-base">
              {currentStepData.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getColorClasses(currentStepData.color)} flex items-center justify-center mb-4`}>
                    {currentStepData.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center">Principais Benefícios</h3>
                    <div className="grid gap-3">
                      {currentStepData.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="gap-2"
            >
              {currentStep === steps.length - 1 ? 'Começar a Usar' : 'Próximo'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Skip option */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Pular apresentação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 