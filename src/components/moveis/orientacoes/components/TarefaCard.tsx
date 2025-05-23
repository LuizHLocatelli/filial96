
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, CircleDashed, CircleEllipsis, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tarefa } from "../types";

interface TarefaCardProps {
  tarefa: Tarefa;
  onAtualizarStatus: (tarefaId: string, novoStatus: string) => void;
  onExcluirTarefa: (tarefaId: string) => void;
}

export function TarefaCard({ tarefa, onAtualizarStatus, onExcluirTarefa }: TarefaCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pendente</Badge>;
      case "em_andamento":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Em andamento</Badge>;
      case "concluida":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Concluída</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <CircleDashed className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case "em_andamento":
        return <CircleEllipsis className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
      default:
        return <CircleDashed className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 sm:pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-1 min-w-0">
            {getStatusIcon(tarefa.status)}
            <span className="truncate">{tarefa.titulo}</span>
          </CardTitle>
          <div className="flex items-center justify-start sm:justify-end">
            {getStatusBadge(tarefa.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-2">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span>
              {format(new Date(tarefa.data_entrega), "PPP", { locale: ptBR })}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
            {tarefa.descricao}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tarefa.status !== "pendente" && (
              <Button
                size="sm"
                variant="outline"
                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-xs sm:text-sm flex-1 sm:flex-none"
                onClick={() => onAtualizarStatus(tarefa.id, "pendente")}
              >
                <CircleDashed className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Pendente</span>
                <span className="sm:hidden">Pend.</span>
              </Button>
            )}
            {tarefa.status !== "em_andamento" && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm flex-1 sm:flex-none"
                onClick={() => onAtualizarStatus(tarefa.id, "em_andamento")}
              >
                <CircleEllipsis className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Em andamento</span>
                <span className="sm:hidden">Andamento</span>
              </Button>
            )}
            {tarefa.status !== "concluida" && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs sm:text-sm flex-1 sm:flex-none"
                onClick={() => onAtualizarStatus(tarefa.id, "concluida")}
              >
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Concluída</span>
                <span className="sm:hidden">Concl.</span>
              </Button>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 w-full sm:w-auto"
            onClick={() => onExcluirTarefa(tarefa.id)}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="ml-1 sm:hidden">Excluir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
