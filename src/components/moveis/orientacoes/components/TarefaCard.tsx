import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, CircleDashed, CircleEllipsis, Trash2, User, Link2, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tarefa } from "../types";
import { TarefaRotinaConnection } from "./TarefaRotinaConnection";
import { supabase } from "@/integrations/supabase/client";

interface TarefaCardProps {
  tarefa: Tarefa;
  onAtualizarStatus: (tarefaId: string, novoStatus: string) => void;
  onExcluirTarefa: (tarefaId: string) => void;
  onViewRotina?: (rotinaId: string) => void;
}

// Add new interface for tarefa with creator name
interface TarefaWithCreator extends Tarefa {
  criador_nome?: string;
}

export function TarefaCard({ tarefa, onAtualizarStatus, onExcluirTarefa, onViewRotina }: TarefaCardProps) {
  const [tarefaWithCreator, setTarefaWithCreator] = useState<TarefaWithCreator>(tarefa);

  useEffect(() => {
    const fetchCreatorName = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', tarefa.criado_por)
        .single();

      if (!error && profile) {
        setTarefaWithCreator({
          ...tarefa,
          criador_nome: profile.name
        });
      } else {
        setTarefaWithCreator({
          ...tarefa,
          criador_nome: 'Usuário desconhecido'
        });
      }
    };

    fetchCreatorName();
  }, [tarefa]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="border-yellow-500/60 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400/40 dark:bg-yellow-400/10 dark:text-yellow-300">Pendente</Badge>;
      case "em_andamento":
        return <Badge variant="outline" className="border-green-500/60 bg-green-500/10 text-green-700 dark:border-green-400/40 dark:bg-green-400/10 dark:text-green-300">Em andamento</Badge>;
      case "concluida":
        return <Badge variant="outline" className="bg-muted/80 text-muted-foreground border-muted/60 dark:bg-zinc-700/50 dark:text-zinc-300 dark:border-zinc-600/80">Concluída</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <CircleDashed className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />;
      case "em_andamento":
        return <CircleEllipsis className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />;
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 dark:text-zinc-400" />;
      default:
        return <CircleDashed className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  return (
    <Card className="overflow-hidden border shadow-soft hover:shadow-md transition-shadow duration-200 dark:bg-green-950/20 dark:border-green-900/30">
      <CardHeader className="pb-3">
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <User className="h-4 w-4" />
          <span>Criado por: {tarefaWithCreator.criador_nome}</span>
        </div>

        {/* Conexão com rotina se existir */}
        {tarefa.rotina_id && (
          <TarefaRotinaConnection 
            tarefa={tarefaWithCreator}
            onViewRotina={onViewRotina}
          />
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tarefa.status !== "pendente" && (
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/60 bg-yellow-500/5 text-yellow-700 hover:bg-yellow-500/10 dark:border-yellow-400/40 dark:bg-transparent dark:text-yellow-400 dark:hover:bg-yellow-400/10 text-xs sm:text-sm flex-1 sm:flex-none"
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
                className="border-green-500/60 bg-green-500/5 text-green-700 hover:bg-green-500/10 dark:border-green-400/40 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-400/10 text-xs sm:text-sm flex-1 sm:flex-none"
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
                className="border-zinc-500/60 bg-zinc-500/5 text-zinc-700 hover:bg-zinc-500/10 dark:border-zinc-500/40 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-700/50 text-xs sm:text-sm flex-1 sm:flex-none"
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
            className="text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 w-full sm:w-auto"
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
