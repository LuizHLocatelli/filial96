import { Clock, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TarefaCard } from "./TarefaCard";
import { Tarefa } from "../types";

interface TarefasListProps {
  tarefas: Tarefa[];
  isLoading: boolean;
  onAtualizarStatus: (tarefaId: string, novoStatus: string) => void;
  onExcluirTarefa: (tarefaId: string) => void;
}

export function TarefasList({ 
  tarefas, 
  isLoading, 
  onAtualizarStatus, 
  onExcluirTarefa 
}: TarefasListProps) {
  if (isLoading) {
    return (
      <Card className="p-6 text-center border shadow-soft">
        <div className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </Card>
    );
  }

  if (tarefas.length === 0) {
    return (
      <Card className="p-6 text-center border shadow-soft">
        <div className="flex flex-col items-center justify-center py-8">
          <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Adicione novas tarefas para começar a organizar o trabalho do setor.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {tarefas.map((tarefa) => (
        <TarefaCard
          key={tarefa.id}
          tarefa={tarefa}
          onAtualizarStatus={onAtualizarStatus}
          onExcluirTarefa={onExcluirTarefa}
        />
      ))}
    </div>
  );
}
