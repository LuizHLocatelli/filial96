
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  FileText, 
  List, 
  Plus,
  CheckCircle2,
  Edit,
  Trash2,
  Activity,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { ActivityItem } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityTimelineItemProps {
  activity: ActivityItem;
  index: number;
  isLast: boolean;
  onItemClick?: (activity: ActivityItem) => void;
}

export function ActivityTimelineItem({ 
  activity, 
  index, 
  isLast,
  onItemClick 
}: ActivityTimelineItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'rotina': return CheckSquare;
      case 'orientacao': return FileText;
      case 'tarefa': return List;
      default: return Activity;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'criada': return Plus;
      case 'concluida': return CheckCircle2;
      case 'atualizada': return Edit;
      case 'deletada': return Trash2;
      default: return Activity;
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
      case 'criada': return 'bg-blue-500 dark:bg-blue-600';
      case 'concluida': return 'bg-green-500 dark:bg-green-600';
      case 'atualizada': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'deletada': return 'bg-red-500 dark:bg-red-600';
      default: return 'bg-muted-foreground';
    }
  };

  const getActionText = (action: string, type: string) => {
    const typeText = type === 'rotina' ? 'rotina' : 
                    type === 'orientacao' ? 'orientação' : 'tarefa';
    
    switch (action) {
      case 'criada': return `criou uma ${typeText}`;
      case 'concluida': return `concluiu a ${typeText}`;
      case 'atualizada': return `atualizou a ${typeText}`;
      case 'deletada': return `removeu a ${typeText}`;
      default: return `${action} a ${typeText}`;
    }
  };

  const getPriorityLevel = (activity: ActivityItem) => {
    if (activity.status === 'atrasada') return 'high';
    if (activity.action === 'concluida') return 'low';
    if (activity.status === 'nova') return 'medium';
    return 'normal';
  };

  const Icon = getIcon(activity.type);
  const ActionIcon = getActionIcon(activity.action);
  const priority = getPriorityLevel(activity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "group relative",
        onItemClick && "cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
      )}
      onClick={() => onItemClick?.(activity)}
    >
      {/* Linha conectora */}
      {!isLast && (
        <div className="absolute left-4 top-10 w-0.5 h-8 bg-border group-hover:bg-primary/30 transition-colors"></div>
      )}
      
      <div className="flex gap-3">
        {/* Avatar/Ícone com prioridade */}
        <div className="relative">
          <motion.div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
              getActionColor(activity.action),
              priority === 'high' && "ring-2 ring-red-400 ring-offset-2",
              priority === 'medium' && "ring-2 ring-yellow-400 ring-offset-1"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-4 w-4 text-white" />
          </motion.div>
          
          {/* Micro ícone de ação */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border-2 border-border flex items-center justify-center">
            <ActionIcon className="h-2 w-2 text-muted-foreground" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              {/* Cabeçalho da ação */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate">{activity.user}</span>
                <span className="text-muted-foreground">
                  {getActionText(activity.action, activity.type)}
                </span>
              </div>
              
              {/* Título da atividade */}
              <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                {activity.title}
              </h4>
              
              {/* Descrição */}
              {activity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {activity.description}
                </p>
              )}
            </div>
            
            {/* Status e ações */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getStatusColor(activity.status))}
              >
                {activity.status}
              </Badge>
              
              {onItemClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Informações temporais */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
            
            <span className="opacity-60">•</span>
            
            <span className="opacity-75">
              {format(new Date(activity.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
