
import { Clock, User, Calendar, MoreVertical, CheckSquare, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TarefaWithCreator } from "../types";
import { TarefaRotinaConnection } from "./TarefaRotinaConnection";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TarefaCardProps {
  tarefa: TarefaWithCreator;
  onAtualizarStatus: (tarefaId: string, novoStatus: string) => void;
  onExcluirTarefa: (tarefaId: string) => void;
  onViewRotina?: (rotinaId: string) => void;
}

export function TarefaCard({ 
  tarefa, 
  onAtualizarStatus, 
  onExcluirTarefa,
  onViewRotina 
}: TarefaCardProps) {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20';
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20';
      case 'atrasada':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600';
    }
  };

  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case 'rotina':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20';
      case 'orientacao':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20';
      case 'manual':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600';
    }
  };

  const handleStatusChange = (novoStatus: string) => {
    onAtualizarStatus(tarefa.id, novoStatus);
  };

  const StatusIcon = () => {
    switch (tarefa.status) {
      case 'concluida':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'atrasada':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <Card className="glass-card glass-hover transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className={cn("pb-3", isMobile && "p-3 pb-2")}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className={cn(
                "text-foreground line-clamp-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                {tarefa.titulo}
              </CardTitle>
              {tarefa.descricao && (
                <p className={cn(
                  "text-muted-foreground mt-1 line-clamp-2",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {tarefa.descricao}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <StatusIcon />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange('pendente')}>
                    Marcar como Pendente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('concluida')}>
                    Marcar como Concluída
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('atrasada')}>
                    Marcar como Atrasada
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onExcluirTarefa(tarefa.id)}
                    className="text-red-600"
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn("pt-0", isMobile && "p-3 pt-0")}>
          {/* Badges de Status e Origem */}
          <div className={cn(
            "flex gap-2 mb-3",
            isMobile && "flex-wrap"
          )}>
            <Badge className={cn(
              getStatusColor(tarefa.status),
              isMobile ? "text-xs px-2 py-1" : "text-sm"
            )}>
              {tarefa.status}
            </Badge>
            <Badge className={cn(
              getOrigemColor(tarefa.origem),
              isMobile ? "text-xs px-2 py-1" : "text-sm"
            )}>
              {tarefa.origem}
            </Badge>
          </div>

          {/* Informações da Tarefa */}
          <div className="space-y-2">
            {tarefa.creator?.nome && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
                  {tarefa.creator.nome}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
                {formatDistanceToNow(new Date(tarefa.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className={cn(
            "flex gap-2 mt-4",
            isMobile && "flex-col"
          )}>
            <Button 
              size="sm" 
              variant="outline" 
              className={cn(
                "flex-1 text-xs",
                isMobile && "w-full h-8"
              )}
            >
              Visualizar
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleStatusChange(tarefa.status === 'concluida' ? 'pendente' : 'concluida')}
              className={cn(
                "flex-1 text-xs",
                isMobile && "w-full h-8"
              )}
            >
              {tarefa.status === 'concluida' ? 'Reabrir' : 'Concluir'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Conexão com Rotina (se existir) */}
      {tarefa.rotina_id && (
        <TarefaRotinaConnection 
          tarefa={tarefa}
          onViewRotina={onViewRotina}
        />
      )}
    </div>
  );
}
