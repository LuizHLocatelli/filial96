
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface TarefasListProps {
  tarefas: any[];
  onViewTarefa?: (tarefaId: string) => void;
}

export function TarefasList({ tarefas, onViewTarefa }: TarefasListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'pendente': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'atrasada': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500 dark:bg-red-600';
      case 'alta': return 'bg-orange-500 dark:bg-orange-600';
      case 'media': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'baixa': return 'bg-green-500 dark:bg-green-600';
      default: return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'concluida': return 'default' as const;
      case 'pendente': return 'secondary' as const;
      case 'atrasada': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {tarefas.map((tarefa) => (
        <div key={tarefa.id} className="p-2 sm:p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
          <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 xs:gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight line-clamp-2">{tarefa.titulo}</h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge 
                  variant={tarefa.prioridade === 'alta' ? 'destructive' : 
                          tarefa.prioridade === 'media' ? 'default' : 'secondary'}
                  className="text-xs px-1.5 py-0.5"
                >
                  {tarefa.prioridade}
                </Badge>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tarefa.tipo}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="bg-muted px-1.5 py-0.5 rounded">
                  {tarefa.dataEntrega && !isNaN(new Date(tarefa.dataEntrega).getTime()) 
                    ? format(new Date(tarefa.dataEntrega), 'dd/MM/yyyy') 
                    : 'Sem data'}
                </span>
              </div>
            </div>
            <div className="flex xs:flex-col items-start xs:items-end gap-1">
              <Badge 
                variant={getStatusVariant(tarefa.status)}
                className="text-xs whitespace-nowrap px-2 py-1"
              >
                {tarefa.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
