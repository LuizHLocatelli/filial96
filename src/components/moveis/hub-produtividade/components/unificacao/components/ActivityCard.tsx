
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
      case 'concluida': return <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'atrasada': return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default: return <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida': 
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
            Concluída
          </Badge>
        );
      case 'atrasada': 
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">
            Atrasada
          </Badge>
        );
      default: 
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
            Pendente
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'rotina' ? 
      <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" /> : 
      <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ptBR });
  };

  return (
    <Card className="hover:shadow-sm transition-shadow dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800/70">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox para marcar como concluída */}
          <Checkbox
            checked={activity.status === 'concluida'}
            onCheckedChange={(checked) => 
              onStatusChange(activity.id, activity.type, checked ? 'concluida' : 'pendente')
            }
            className="mt-1 dark:border-gray-600"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Título e tipo */}
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(activity.type)}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs dark:border-gray-600 dark:text-gray-300"
                  >
                    {activity.type === 'rotina' ? 'Rotina' : 'Tarefa'}
                  </Badge>
                </div>
                
                {/* Descrição */}
                {activity.description && (
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                )}
                
                {/* Metadados */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(activity.timestamp)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.user}
                  </div>
                  
                  {activity.category && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs dark:bg-gray-700 dark:text-gray-300"
                    >
                      {activity.category}
                    </Badge>
                  )}
                  
                  {activity.periodicidade && (
                    <Badge 
                      variant="outline" 
                      className="text-xs dark:border-gray-600 dark:text-gray-300"
                    >
                      {activity.periodicidade}
                    </Badge>
                  )}
                  
                  {activity.priority && (
                    <Badge 
                      variant={activity.priority === 'alta' ? 'destructive' : 'secondary'} 
                      className={cn(
                        "text-xs",
                        activity.priority === 'alta' 
                          ? "dark:bg-red-900/30 dark:text-red-300" 
                          : "dark:bg-gray-700 dark:text-gray-300"
                      )}
                    >
                      {activity.priority}
                    </Badge>
                  )}
                  
                  {activity.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(activity.dueDate), 'dd/MM', { locale: ptBR })}
                    </div>
                  )}
                  
                  {activity.connections && activity.connections.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {activity.connections.length} conexão(ões)
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status e ações */}
              <div className="flex items-center gap-2 ml-2">
                {getStatusBadge(activity.status)}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  >
                    <DropdownMenuItem 
                      onClick={() => onEdit(activity.id, activity.type)}
                      className="dark:hover:bg-gray-700 dark:text-gray-200"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    
                    {activity.type === 'rotina' && (
                      <DropdownMenuItem 
                        onClick={() => onCreateRelated(activity.id, 'rotina', 'tarefa')}
                        className="dark:hover:bg-gray-700 dark:text-gray-200"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Tarefa
                      </DropdownMenuItem>
                    )}
                    
                    {activity.type === 'tarefa' && (
                      <DropdownMenuItem 
                        onClick={() => onCreateRelated(activity.id, 'tarefa', 'rotina')}
                        className="dark:hover:bg-gray-700 dark:text-gray-200"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Rotina
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 dark:hover:bg-gray-700"
                      onClick={() => onDelete(activity.id, activity.type)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
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
