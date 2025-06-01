import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, CircleDashed, CircleEllipsis, Trash2, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tarefa } from "../types";
import { supabase } from "@/integrations/supabase/client";

interface TarefaCardProps {
  tarefa: Tarefa;
  onAtualizarStatus: (tarefaId: string, novoStatus: string) => void;
  onExcluirTarefa: (tarefaId: string) => void;
}

// Add new interface for tarefa with creator name
interface TarefaWithCreator extends Tarefa {
  criador_nome?: string;
}

export function TarefaCard({ tarefa, onAtualizarStatus, onExcluirTarefa }: TarefaCardProps) {
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
        return <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent/40 dark:bg-accent/30 dark:text-accent-foreground dark:border-accent/50">Pendente</Badge>;
      case "em_andamento":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30">Em andamento</Badge>;
      case "concluida":
        return <Badge variant="outline" className="bg-muted/80 text-muted-foreground border-muted/60 dark:bg-muted/40 dark:text-muted-foreground dark:border-muted/70">Concluída</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <CircleDashed className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />;
      case "em_andamento":
        return <CircleEllipsis className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />;
      default:
        return <CircleDashed className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  return (
    <Card className="overflow-hidden border shadow-soft hover:shadow-md transition-shadow duration-200">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tarefa.status !== "pendente" && (
              <Button
                size="sm"
                variant="outline"
                className="text-accent-foreground border-accent/40 hover:bg-accent/20 dark:hover:bg-accent/30 text-xs sm:text-sm flex-1 sm:flex-none"
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
                className="text-primary border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20 text-xs sm:text-sm flex-1 sm:flex-none"
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
                className="text-muted-foreground border-muted/50 hover:bg-muted/20 dark:hover:bg-muted/30 text-xs sm:text-sm flex-1 sm:flex-none"
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
