import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useAuth } from "@/contexts/auth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WelcomeHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmojiComponent = ({ emoji, className }: { emoji: string, className?: string }) => (
  <span className={cn("flex items-center justify-center", className)} style={{ fontStyle: 'normal' }}>
    {emoji}
  </span>
);


const STEPS = [
  {
    title: "Seja bem-vindo!",
    subtitle: "Seu novo App Filial 96",
    emoji: "👋",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed text-base">
          Opa! Que bom ter você aqui. Esse app foi pensado para facilitar sua rotina e deixar tudo o que você precisa na palma da mão.
        </p>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">⚡</span>
          <p className="text-sm font-medium">
            De escalas a gestão de estoque, agora tá tudo em um só lugar.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Direto ao ponto",
    subtitle: "Móveis, Moda e Finanças",
    emoji: "📦",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Nada de complicação. Agora você resolve as contagens de estoque e cuida dos depósitos do crediário rapidinho:
        </p>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-xl">👕</span>
            <div>
              <p className="text-sm font-semibold">Móveis & Moda</p>
              <p className="text-xs text-muted-foreground">Estoque e contagens em tempo real.</p>
            </div>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-sm font-semibold">Crediário</p>
              <p className="text-xs text-muted-foreground">Depósitos e fluxos financeiros simplificados.</p>
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Agilize seu dia",
    subtitle: "Escalas e Apoio com IA",
    emoji: "🚀",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Chega de papel ou dúvida. Veja tudo direto no celular:
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm font-semibold">Escalas Digitais</p>
              <p className="text-xs text-muted-foreground">Consulte horários e folgas na hora.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
            <span className="text-xl">🤖</span>
            <div>
              <p className="text-sm font-semibold">Assistentes IA</p>
              <p className="text-xs text-muted-foreground">Tire dúvidas sobre procedimentos instantaneamente.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Bora começar?",
    subtitle: "O App é todo seu",
    emoji: "✨",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    content: (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <p className="text-muted-foreground">
          Explore as ferramentas e sinta-se em casa. O Hub de Produtividade é o ponto de partida ideal.
        </p>
        <p className="text-sm font-bold text-primary">
          Dica: Use os atalhos do Hub para o que você mais usa no dia a dia.
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
            icon={React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => <EmojiComponent emoji={step.emoji} {...props} />) as unknown as import("lucide-react").LucideIcon} 
            title={currentStep === 0 ? `Fala, ${userName}!` : step.title}
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
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1 mb-6">
                  <div className={`p-3 rounded-2xl ${step.bg} inline-flex mb-2 shadow-inner`}>
                    <span className="text-3xl leading-none">{step.emoji}</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">{step.subtitle}</p>
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
