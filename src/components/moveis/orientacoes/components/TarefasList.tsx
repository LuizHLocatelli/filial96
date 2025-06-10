
import { Clock, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TarefaCard } from "./TarefaCard";
import { TarefaWithCreator } from "../types"; // Use TarefaWithCreator instead of Tarefa
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TarefasListProps {
  tarefas: TarefaWithCreator[]; // Changed from Tarefa[] to TarefaWithCreator[]
  isLoading: boolean;
  onAtualizarStatus: (tarefaId: string, novoStatus: string) => void;
  onExcluirTarefa: (tarefaId: string) => void;
  onViewRotina?: (rotinaId: string) => void;
}

export function TarefasList({ 
  tarefas, 
  isLoading, 
  onAtualizarStatus, 
  onExcluirTarefa,
  onViewRotina 
}: TarefasListProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="glass-card p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </Card>
    );
  }

  if (tarefas.length === 0) {
    return (
      <Card className="glass-card p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className={cn(
            "font-medium mb-2",
            isMobile ? "text-base" : "text-lg"
          )}>
            Nenhuma tarefa encontrada
          </h3>
          <p className={cn(
            "text-muted-foreground max-w-sm",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Adicione novas tarefas para começar a organizar o trabalho do setor.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      isMobile 
        ? "grid-cols-1" 
        : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
    )}>
      {tarefas.map((tarefa) => (
        <TarefaCard
          key={tarefa.id}
          tarefa={tarefa}
          onAtualizarStatus={onAtualizarStatus}
          onExcluirTarefa={onExcluirTarefa}
          onViewRotina={onViewRotina}
        />
      ))}
    </div>
  );
}
