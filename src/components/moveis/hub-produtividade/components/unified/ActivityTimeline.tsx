import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckSquare, 
  FileText, 
  List, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Activity
} from 'lucide-react';
import { ActivityItem } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  isLoading: boolean;
  maxItems?: number;
}

export function ActivityTimeline({ 
  activities, 
  isLoading, 
  maxItems = 20 
}: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string, action: string) => {
    switch (type) {
      case 'rotina':
        return CheckSquare;
      case 'orientacao':
        return FileText;
      case 'tarefa':
        return List;
      default:
        return Activity;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'criada':
        return Plus;
      case 'concluida':
        return CheckCircle2;
      case 'atualizada':
        return Edit;
      case 'deletada':
        return Trash2;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'atrasada':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'nova':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'criada':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'concluida':
        return 'bg-green-500 dark:bg-green-600';
      case 'atualizada':
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'deletada':
        return 'bg-red-500 dark:bg-red-600';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getActionText = (action: string, type: string) => {
    const typeText = type === 'rotina' ? 'rotina' : 
                    type === 'orientacao' ? 'orientação' : 'tarefa';
    
    switch (action) {
      case 'criada':
        return `criou uma ${typeText}`;
      case 'concluida':
        return `concluiu a ${typeText}`;
      case 'atualizada':
        return `atualizou a ${typeText}`;
      case 'deletada':
        return `removeu a ${typeText}`;
      default:
        return `${action} a ${typeText}`;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Atividades
          </div>
          {activities.length > 0 && (
            <Badge variant="outline">
              {activities.length} atividades
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground">Nenhuma atividade recente</h3>
            <p className="text-sm text-muted-foreground">
              As atividades aparecerão aqui conforme você usa o sistema
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {displayedActivities.map((activity, index) => {
                const Icon = getIcon(activity.type, activity.action);
                const ActionIcon = getActionIcon(activity.action);
                
                return (
                  <div key={activity.id} className="relative">
                    {/* Linha conectora (exceto no último item) */}
                    {index < displayedActivities.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-6 bg-border"></div>
                    )}
                    
                    <div className="flex gap-3">
                      {/* Avatar/Ícone */}
                      <div className="relative">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          getActionColor(activity.action)
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        {/* Micro ícone de ação */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border-2 border-border flex items-center justify-center">
                          <ActionIcon className="h-2 w-2 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.user}</span>
                              {' '}
                              <span className="text-muted-foreground">
                                {getActionText(activity.action, activity.type)}
                              </span>
                            </p>
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            {activity.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Status e tempo */}
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getStatusColor(activity.status))}
                            >
                              {activity.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.timestamp), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Data completa em hover ou para debug */}
                        <div className="text-xs text-muted-foreground opacity-75">
                          {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Indicador de mais itens */}
              {activities.length > maxItems && (
                <div className="text-center py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    e mais {activities.length - maxItems} atividades...
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
} 