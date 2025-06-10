
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
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={onCreateAutomaticTask}
        disabled={isCreating}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        {isCreating ? 'Criando...' : 'Gerar Tarefa'}
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onCreateManualTask}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Nova Tarefa Manual
      </Button>
    </div>
  );
}
