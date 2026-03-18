import { CalendarDays, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EscalaEmptyStateProps {
  isManager: boolean;
  onGenerate: () => void;
}

export function EscalaEmptyState({ isManager, onGenerate }: EscalaEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="rounded-2xl bg-primary/10 p-5">
          <CalendarDays className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 rounded-full bg-primary/20 p-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Nenhuma escala neste mês</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {isManager
          ? "Gere automaticamente a escala de carga da equipe, respeitando rotações e espelhamento."
          : "Ainda não há escalas geradas para este período. Aguarde o gerente criar a escala."}
      </p>

      {isManager && (
        <Button onClick={onGenerate} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Gerar Escala
        </Button>
      )}
    </div>
  );
}
