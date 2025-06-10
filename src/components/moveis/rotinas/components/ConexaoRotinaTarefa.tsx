
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";
import { RotinaWithStatus } from "../types";
import { TarefasStats } from "./conexao-rotina-tarefa/TarefasStats";
import { ConnectionActions } from "./conexao-rotina-tarefa/ConnectionActions";
import { TarefasList } from "./conexao-rotina-tarefa/TarefasList";
import { ProgressIndicator } from "./conexao-rotina-tarefa/ProgressIndicator";
import { EmptyState } from "./conexao-rotina-tarefa/EmptyState";
import { useConexaoRotinaTarefa } from "./conexao-rotina-tarefa/useConexaoRotinaTarefa";

interface ConexaoRotinaTarefaProps {
  rotina: RotinaWithStatus;
  onCreateTarefa?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

export function ConexaoRotinaTarefa({ 
  rotina, 
  onCreateTarefa,
  onViewTarefa 
}: ConexaoRotinaTarefaProps) {
  const {
    tarefasRelacionadas,
    isLoading,
    isCreatingTarefa,
    criarTarefaAutomatica
  } = useConexaoRotinaTarefa(rotina);

  const handleCreateManualTask = () => {
    onCreateTarefa?.(rotina.id);
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-green-600" />
          Conexão Rotina ↔ Tarefas
          {tarefasRelacionadas.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {tarefasRelacionadas.length} tarefa{tarefasRelacionadas.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <TarefasStats tarefas={tarefasRelacionadas} />

        <ConnectionActions
          onCreateAutomaticTask={criarTarefaAutomatica}
          onCreateManualTask={handleCreateManualTask}
          isCreating={isCreatingTarefa}
        />

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tarefasRelacionadas.length > 0 ? (
          <div className="space-y-2">
            <TarefasList 
              tarefas={tarefasRelacionadas} 
              onViewTarefa={onViewTarefa}
            />
          </div>
        ) : (
          <EmptyState />
        )}

        <ProgressIndicator tarefas={tarefasRelacionadas} />
      </CardContent>
    </Card>
  );
}
