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
        "group relative py-1.5 px-1",
        onItemClick && "cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
      )}
      onClick={() => onItemClick?.(activity)}
    >
      {/* Linha conectora */}
      {!isLast && (
        <div className="absolute left-4 top-8 w-0.5 h-3 bg-border"></div>
      )}
      
      <div className="flex gap-2.5">
        {/* Avatar compacto */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div 
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              getActionColor(activity.action)
            )}
          >
            <Icon className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Conteúdo ultra compacto */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header: Status + User + Action */}
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="outline" 
              className={cn("text-3xs px-1 py-0 h-3.5 leading-none", getStatusColor(activity.status))}
            >
              {activity.status === 'concluida' ? 'OK' :
               activity.status === 'pendente' ? 'P' :
               activity.status === 'atrasada' ? 'A' :
               activity.status === 'nova' ? 'N' : '?'}
            </Badge>
            
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-3xs font-medium truncate">{activity.user}</span>
              <span className="text-3xs text-muted-foreground">
                {activity.action === 'criada' ? '→' : 
                 activity.action === 'concluida' ? '✓' : 
                 activity.action === 'atualizada' ? '↻' : 
                 activity.action === 'deletada' ? '✕' : '•'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-3xs text-muted-foreground">
              <Clock className="h-2 w-2" />
              <span className="truncate">
                {format(new Date(activity.timestamp), 'HH:mm')}
              </span>
            </div>
          </div>
          
          {/* Título principal */}
          <h4 className="text-2xs font-medium leading-tight line-clamp-2">
            {activity.title}
          </h4>
          
          {/* Descrição opcional */}
          {activity.description && activity.description.length > 0 && (
            <p className="text-3xs text-muted-foreground line-clamp-1 leading-tight">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
