
import { Calendar } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Nenhuma tarefa relacionada</p>
      <p className="text-xs">Crie tarefas para organizar o trabalho desta rotina</p>
    </div>
  );
}
