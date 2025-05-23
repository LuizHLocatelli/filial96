
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface TarefasHeaderProps {
  showForm: boolean;
  onToggleForm: () => void;
}

export function TarefasHeader({ showForm, onToggleForm }: TarefasHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Tarefas de VM</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie e acompanhe as tarefas do setor de móveis
        </p>
      </div>
      <Button 
        onClick={onToggleForm} 
        variant={showForm ? "outline" : "default"} 
        size="sm"
        className="w-full sm:w-auto"
      >
        {showForm ? (
          <>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </>
        )}
      </Button>
    </div>
  );
}
