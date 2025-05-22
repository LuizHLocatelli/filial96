
import { Button } from "@/components/ui/button";
import { KanbanSquare, Plus } from "lucide-react";

export function BoardEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-6 mb-4">
        <KanbanSquare className="h-12 w-12 text-primary dark:text-primary/80" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Nenhum quadro encontrado</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Não encontramos nenhum quadro kanban configurado para o setor de crediário.
        Entre em contato com o administrador do sistema para configurá-lo.
      </p>
      
      <Button className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        <span>Criar Quadro</span>
      </Button>
    </div>
  );
}
