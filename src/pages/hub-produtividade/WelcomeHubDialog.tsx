import React, { useState, useEffect } from "react";
import { 
  Bot, 
  Calendar, 
  ShoppingBag, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Zap,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useAuth } from "@/contexts/auth";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  {
    title: "Bem-vindo à Filial 96",
    subtitle: "Sua nova central de operações",
    icon: ShieldCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Olá! Estamos muito felizes em ter você aqui. O App Filial 96 foi redesenhado para ser seu braço direito no dia a dia da loja.
        </p>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm">
            Tudo o que você precisa — de escalas a gestão de estoque — está agora em um só lugar, acessível de qualquer dispositivo.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Operações & Vendas",
    subtitle: "Móveis, Moda e Crediário",
    icon: ShoppingBag,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Gerencie os setores core da loja com ferramentas específicas:
        </p>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">Móveis & Moda:</span>
            <span className="text-sm text-muted-foreground">Estoque e contagens em tempo real.</span>
          </li>
          <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">Crediário:</span>
            <span className="text-sm text-muted-foreground">Depósitos e fluxos financeiros simplificados.</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Produtividade & IA",
    subtitle: "Ferramentas Inteligentes",
    icon: Bot,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Otimize seu tempo com nossos assistentes e utilitários:
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
            <Calendar className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold">Escalas Digitais</p>
              <p className="text-xs text-muted-foreground">Consulte horários e folgas instantaneamente.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
            <Bot className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold">Assistentes IA</p>
              <p className="text-xs text-muted-foreground">Suporte inteligente para dúvidas e procedimentos.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Tudo Pronto!",
    subtitle: "Vamos começar?",
    icon: LayoutDashboard,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    content: (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-orange-500" />
        </div>
        <p className="text-muted-foreground">
          Explore o menu e descubra como a Filial 96 pode facilitar seu trabalho hoje.
        </p>
        <p className="text-sm font-medium text-primary">
          Dica: Use o Hub de Produtividade para acesso rápido às ferramentas frequentes.
        </p>
      </div>
    )
  }
];

export function WelcomeHubDialog({ open, onOpenChange }: WelcomeHubDialogProps) {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  // Reset step when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const userName = profile?.name?.split(' ')[0] || "Colaborador";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0 border-none sm:border bg-transparent shadow-none sm:shadow-2xl" hideCloseButton>
        <div className="glass-card flex flex-col h-full overflow-hidden border-none sm:border">
          <StandardDialogHeader 
            icon={step.icon} 
            title={currentStep === 0 ? `Olá, ${userName}!` : step.title}
            onClose={() => onOpenChange(false)} 
          />
          
          <DialogScrollableContainer className="px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 mb-6">
                  <div className={`p-3 rounded-2xl ${step.bg} ${step.color} inline-flex mb-2`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{step.subtitle}</p>
                </div>

                {step.content}
              </motion.div>
            </AnimatePresence>
          </DialogScrollableContainer>

          <StandardDialogFooter className="flex items-center justify-between px-6 py-4 bg-muted/30">
            <div className="flex gap-1">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? "w-6 bg-primary" : "w-1.5 bg-primary/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <Button 
                variant={currentStep === STEPS.length - 1 ? "success" : "default"}
                onClick={handleNext}
                className="gap-2 min-w-[100px]"
              >
                {currentStep === STEPS.length - 1 ? (
                  <>
                    Começar
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </StandardDialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
