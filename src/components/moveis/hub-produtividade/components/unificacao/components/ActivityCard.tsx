import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Plus,
  CheckCircle2,
  AlertCircle,
  Link2,
  Calendar,
  User,
  Circle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UnifiedActivity {
  id: string;
  type: 'rotina' | 'tarefa';
  title: string;
  description?: string;
  status: 'concluida' | 'pendente' | 'atrasada';
  timestamp: string;
  user: string;
  category?: string;
  priority?: string;
  dueDate?: string;
  periodicidade?: string;
  connections?: string[];
}

interface ActivityCardProps {
  activity: UnifiedActivity;
  onStatusChange: (id: string, type: 'rotina' | 'tarefa', status: string) => void;
  onEdit: (id: string, type: 'rotina' | 'tarefa') => void;
  onDelete: (id: string, type: 'rotina' | 'tarefa') => void;
  onCreateRelated: (parentId: string, parentType: 'rotina' | 'tarefa', newType: 'rotina' | 'tarefa') => void;
}

export function ActivityCard({
  activity,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateRelated
}: ActivityCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400" />;
      case 'atrasada': return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400" />;
      default: return <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1";
    switch (status) {
      case 'concluida': 
        return (
          <Badge variant="outline" className={cn(baseClasses, "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700")}>
            Concluída
          </Badge>
        );
      case 'atrasada': 
        return (
          <Badge variant="outline" className={cn(baseClasses, "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700")}>
            Atrasada
          </Badge>
        );
      default: 
        return (
          <Badge variant="outline" className={cn(baseClasses, "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600")}>
            Pendente
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'rotina' ? 
      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" /> : 
      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ptBR });
  };

  return (
    <Card className="hover:shadow-sm transition-shadow dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800/70">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start space-x-2 sm:space-x-3">
          {/* Checkbox para marcar como concluída */}
          <Checkbox
            checked={activity.status === 'concluida'}
            onCheckedChange={(checked) => 
              onStatusChange(activity.id, activity.type, checked ? 'concluida' : 'pendente')
            }
            className="mt-0.5 sm:mt-1 dark:border-gray-600 flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Título e tipo */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                  {getTypeIcon(activity.type)}
                  <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                    {activity.title}
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-[9px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 dark:border-gray-600 dark:text-gray-300 flex-shrink-0"
                  >
                    {activity.type === 'rotina' ? 'Rotina' : 'Tarefa'}
                  </Badge>
                </div>
                
                {/* Descrição */}
                {activity.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                    {activity.description}
                  </p>
                )}
                
                {/* Metadados - Layout responsivo aprimorado */}
                <div className="space-y-1.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3 text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>{formatDateTime(activity.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="truncate max-w-20 sm:max-w-none">{activity.user}</span>
                    </div>
                  </div>
                  
                  {/* Segunda linha de metadados no mobile */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {activity.category && (
                      <Badge 
                        variant="secondary" 
                        className="text-[9px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {activity.category}
                      </Badge>
                    )}
                    
                    {activity.periodicidade && (
                      <Badge 
                        variant="outline" 
                        className="text-[9px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5 dark:border-gray-600 dark:text-gray-300"
                      >
                        {activity.periodicidade}
                      </Badge>
                    )}
                    
                    {activity.priority && (
                      <Badge 
                        variant={activity.priority === 'alta' ? 'destructive' : 'secondary'} 
                        className={cn(
                          "text-[9px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0.5",
                          activity.priority === 'alta' 
                            ? "dark:bg-red-900/30 dark:text-red-300" 
                            : "dark:bg-gray-700 dark:text-gray-300"
                        )}
                      >
                        {activity.priority}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Terceira linha para informações extras */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {activity.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{format(new Date(activity.dueDate), 'dd/MM', { locale: ptBR })}</span>
                      </div>
                    )}
                    
                    {activity.connections && activity.connections.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Link2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{activity.connections.length} conexão(ões)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status e ações */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 flex-shrink-0">
                {getStatusBadge(activity.status)}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="touch-friendly p-0 dark:hover:bg-gray-700 flex-shrink-0"
                    >
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="dark:bg-gray-800 dark:border-gray-700 w-40 sm:w-auto"
                  >
                    <DropdownMenuItem 
                      onClick={() => onEdit(activity.id, activity.type)}
                      className="dark:hover:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm"
                    >
                      <Edit2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Editar
                    </DropdownMenuItem>
                    
                    {activity.type === 'rotina' && (
                      <DropdownMenuItem 
                        onClick={() => onCreateRelated(activity.id, 'rotina', 'tarefa')}
                        className="dark:hover:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm"
                      >
                        <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Criar Tarefa
                      </DropdownMenuItem>
                    )}
                    
                    {activity.type === 'tarefa' && (
                      <DropdownMenuItem 
                        onClick={() => onCreateRelated(activity.id, 'tarefa', 'rotina')}
                        className="dark:hover:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm"
                      >
                        <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Criar Rotina
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 dark:hover:bg-gray-700 text-xs sm:text-sm"
                      onClick={() => onDelete(activity.id, activity.type)}
                    >
                      <Trash2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
