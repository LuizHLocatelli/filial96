
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TarefasHeaderProps {
  showForm: boolean;
  onToggleForm: () => void;
}

export function TarefasHeader({ showForm, onToggleForm }: TarefasHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex items-start justify-between gap-3 mb-6",
      isMobile && "flex-col"
    )}>
      <div className="min-w-0 flex-1">
        <h2 className={cn(
          "font-bold text-foreground",
          isMobile ? "text-lg" : "text-xl sm:text-2xl"
        )}>
          Tarefas
        </h2>
        <p className={cn(
          "text-muted-foreground mt-1",
          isMobile ? "text-xs" : "text-sm"
        )}>
          Gerencie e acompanhe as tarefas do setor de móveis
        </p>
      </div>
      
      <Button 
        onClick={onToggleForm} 
        variant={showForm ? "outline" : "default"} 
        size="sm"
        className={cn(
          "gap-2",
          isMobile && "w-full h-9"
        )}
      >
        {showForm ? (
          <>
            <X className="h-4 w-4" />
            Cancelar
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </>
        )}
      </Button>
    </div>
  );
}
