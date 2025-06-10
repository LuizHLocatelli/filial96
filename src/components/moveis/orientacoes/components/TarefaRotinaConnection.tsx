
import { Card, CardContent } from "@/components/ui/card";
import { TarefaExpandida } from "../types";
import { motion } from "framer-motion";
import { ConnectionHeader } from "./tarefa-rotina-connection/ConnectionHeader";
import { LoadingState } from "./tarefa-rotina-connection/LoadingState";
import { RotinaInfo } from "./tarefa-rotina-connection/RotinaInfo";
import { QuickActions } from "./tarefa-rotina-connection/QuickActions";
import { EmptyState } from "./tarefa-rotina-connection/EmptyState";
import { useTarefaRotinaConnection } from "./tarefa-rotina-connection/useTarefaRotinaConnection";

interface TarefaRotinaConnectionProps {
  tarefa: TarefaExpandida;
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

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
      <CardContent className="p-4">
        <div className="space-y-3">
          <ConnectionHeader origem={tarefa.origem} />

          {isLoading ? (
            <LoadingState />
          ) : rotinaRelacionada ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <RotinaInfo 
                rotina={rotinaRelacionada} 
                onViewRotina={onViewRotina}
              />
              
              <QuickActions 
                rotinaId={rotinaRelacionada.id}
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
