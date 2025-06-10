
import { ConnectionHeader } from "./tarefa-rotina-connection/ConnectionHeader";
import { RotinaInfo } from "./tarefa-rotina-connection/RotinaInfo";
import { QuickActions } from "./tarefa-rotina-connection/QuickActions";
import { LoadingState } from "./tarefa-rotina-connection/LoadingState";
import { EmptyState } from "./tarefa-rotina-connection/EmptyState";
import { useTarefaRotinaConnection } from "./tarefa-rotina-connection/useTarefaRotinaConnection";

interface TarefaRotinaConnectionProps {
  tarefaId: string;
  onViewRotina?: (rotinaId: string) => void;
}

export function TarefaRotinaConnection({ tarefaId, onViewRotina }: TarefaRotinaConnectionProps) {
  const { 
    rotinaRelacionada, 
    isLoading
  } = useTarefaRotinaConnection(tarefaId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!rotinaRelacionada) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <ConnectionHeader 
        title="Rotina Conectada"
        description="Informações da rotina vinculada a esta tarefa"
      />
      
      <RotinaInfo rotina={rotinaRelacionada} />
      
      <QuickActions
        rotinaId={rotinaRelacionada.id}
        onViewRotina={onViewRotina}
      />
    </div>
  );
}
