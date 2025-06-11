
import { Calendar } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-4 sm:py-6 px-2 text-muted-foreground">
      <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm font-medium mb-1">Nenhuma tarefa relacionada</p>
      <p className="text-xs leading-relaxed max-w-xs mx-auto">Crie tarefas para organizar o trabalho desta rotina</p>
    </div>
  );
}
