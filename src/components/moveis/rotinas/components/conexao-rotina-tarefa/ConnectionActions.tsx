
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

interface ConnectionActionsProps {
  onCreateAutomaticTask: () => void;
  onCreateManualTask: () => void;
  isCreating: boolean;
}

export function ConnectionActions({ 
  onCreateAutomaticTask, 
  onCreateManualTask, 
  isCreating 
}: ConnectionActionsProps) {
  return (
    <div className="flex flex-col xs:flex-row gap-2 w-full">
      <Button
        size="sm"
        onClick={onCreateAutomaticTask}
        disabled={isCreating}
        className="flex items-center justify-center gap-2 h-8 text-xs whitespace-nowrap flex-1 xs:flex-none"
      >
        <Plus className="h-3 w-3 flex-shrink-0" />
        <span className="hidden xs:inline">{isCreating ? 'Criando...' : 'Gerar Tarefa'}</span>
        <span className="xs:hidden">{isCreating ? 'Criando...' : 'Gerar'}</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateManualTask}
        disabled={isCreating}
        className="flex items-center justify-center gap-2 h-8 text-xs whitespace-nowrap flex-1 xs:flex-none"
      >
        <Calendar className="h-3 w-3 flex-shrink-0" />
        <span className="hidden sm:inline">Nova Tarefa Manual</span>
        <span className="sm:hidden">Nova Tarefa</span>
      </Button>
    </div>
  );
}
