
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
    <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="text-center">
        <div className="text-sm font-medium text-green-600">{concluidas}</div>
        <div className="text-xs text-muted-foreground">Concluídas</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-yellow-600">{pendentes}</div>
        <div className="text-xs text-muted-foreground">Pendentes</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-red-600">{atrasadas}</div>
        <div className="text-xs text-muted-foreground">Atrasadas</div>
      </div>
    </div>
  );
}
