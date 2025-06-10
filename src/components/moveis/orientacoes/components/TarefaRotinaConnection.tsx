
import { Card, CardContent } from "@/components/ui/card";
import { TarefaWithCreator, RotinaWithStatus } from "../types"; // Import the local RotinaWithStatus
import { motion } from "framer-motion";
import { ConnectionHeader } from "./tarefa-rotina-connection/ConnectionHeader";
import { LoadingState } from "./tarefa-rotina-connection/LoadingState";
import { RotinaInfo } from "./tarefa-rotina-connection/RotinaInfo";
import { QuickActions } from "./tarefa-rotina-connection/QuickActions";
import { EmptyState } from "./tarefa-rotina-connection/EmptyState";
import { useTarefaRotinaConnection } from "./tarefa-rotina-connection/useTarefaRotinaConnection";

interface TarefaRotinaConnectionProps {
  tarefa: TarefaWithCreator;
  onViewRotina?: (rotinaId: string) => void;
}

export function TarefaRotinaConnection({ 
  tarefa, 
  onViewRotina 
}: TarefaRotinaConnectionProps) {
  const { rotinaRelacionada, isLoading } = useTarefaRotinaConnection(tarefa.rotina_id);

  // Se não há rotina relacionada, não mostra o componente
  if (!tarefa.rotina_id || (!isLoading && !rotinaRelacionada)) {
    return null;
  }

  // Create a compatible rotina object with titulo property
  const rotinaWithTitulo: RotinaWithStatus | null = rotinaRelacionada ? {
    ...rotinaRelacionada,
    titulo: rotinaRelacionada.nome || rotinaRelacionada.titulo || 'Rotina sem título'
  } : null;

  return (
    <Card className="border-l-4 border-l-green-600 bg-green-100/70 dark:bg-green-950/20 dark:border-l-green-500/70">
      <CardContent className="p-4">
        <div className="space-y-3">
          <ConnectionHeader origem={tarefa.origem} />

          {isLoading ? (
            <LoadingState />
          ) : rotinaWithTitulo ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <RotinaInfo 
                rotina={rotinaWithTitulo} 
                onViewRotina={onViewRotina}
              />
              
              <QuickActions 
                rotinaId={rotinaWithTitulo.id}
                onViewRotina={onViewRotina}
              />
            </motion.div>
          ) : (
            <EmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
