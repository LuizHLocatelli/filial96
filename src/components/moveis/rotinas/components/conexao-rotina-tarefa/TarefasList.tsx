
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface TarefasListProps {
  tarefas: any[];
  onViewTarefa?: (tarefaId: string) => void;
}

export function TarefasList({ tarefas, onViewTarefa }: TarefasListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Tarefas Relacionadas
      </h4>
      
      {tarefas.map((tarefa) => (
        <div
          key={tarefa.id}
          className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => onViewTarefa?.(tarefa.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium">{tarefa.titulo}</h5>
                <div className={`w-2 h-2 rounded-full ${getPrioridadeColor('media')}`} />
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  rotina
                </Badge>
                <span>Entrega: {new Date(tarefa.data_entrega).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(tarefa.status)}>
                {tarefa.status}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
