
import { ConnectionHeader } from "./tarefa-rotina-connection/ConnectionHeader";
import { RotinaInfo } from "./tarefa-rotina-connection/RotinaInfo";
import { QuickActions } from "./tarefa-rotina-connection/QuickActions";
import { LoadingState } from "./tarefa-rotina-connection/LoadingState";
import { EmptyState } from "./tarefa-rotina-connection/EmptyState";
import { useTarefaRotinaConnection } from "./tarefa-rotina-connection/useTarefaRotinaConnection";

interface TarefaRotinaConnectionProps {
  tarefaId: string;
}

export function TarefaRotinaConnection({ tarefaId }: TarefaRotinaConnectionProps) {
  const { 
    rotina, 
    isLoading, 
    isCreatingTarefa, 
    criarTarefaAutomatica 
  } = useTarefaRotinaConnection(tarefaId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!rotina) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <ConnectionHeader 
        title="Rotina Conectada"
        description="Informações da rotina vinculada a esta tarefa"
      />
      
      <RotinaInfo rotina={rotina} />
      
      <QuickActions
        rotinaId={rotina.id}
        onCreateTarefa={criarTarefaAutomatica}
        isCreating={isCreatingTarefa}
      />
    </div>
  );
}
