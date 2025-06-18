
import { Badge } from "@/components/ui/badge";

interface TarefasStatsProps {
  tarefas: any[];
}

export function TarefasStats({ tarefas }: TarefasStatsProps) {
  if (tarefas.length === 0) return null;

  const concluidas = tarefas.filter(t => t.status === 'concluida').length;
  const pendentes = tarefas.filter(t => t.status === 'pendente').length;
  const atrasadas = tarefas.filter(t => t.status === 'atrasada').length;

  return (
    <div className="grid-responsive-cards">
      <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
        <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{concluidas}</div>
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Concluídas</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
        <div className="text-lg sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendentes}</div>
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Pendentes</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
        <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{atrasadas}</div>
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Atrasadas</div>
      </div>
    </div>
  );
}
