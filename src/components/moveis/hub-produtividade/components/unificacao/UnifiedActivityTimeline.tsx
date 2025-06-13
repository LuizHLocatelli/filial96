
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Link2,
  Calendar,
  User
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  connections?: string[]; // IDs de atividades relacionadas
}

interface UnifiedActivityTimelineProps {
  rotinas: any[];
  tarefas: any[];
  isLoading: boolean;
  onStatusChange: (id: string, type: 'rotina' | 'tarefa', status: string) => void;
  onEdit: (id: string, type: 'rotina' | 'tarefa') => void;
  onDelete: (id: string, type: 'rotina' | 'tarefa') => void;
  onCreateRelated: (parentId: string, parentType: 'rotina' | 'tarefa', newType: 'rotina' | 'tarefa') => void;
  onCreateNew: (type: 'rotina' | 'tarefa') => void;
  getCachedUserName: (userId: string) => string;
  onAddTarefa: () => void;
}

export function UnifiedActivityTimeline({
  rotinas,
  tarefas,
  isLoading,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateRelated,
  onCreateNew,
  getCachedUserName,
  onAddTarefa
}: UnifiedActivityTimelineProps) {
  const isMobile = useIsMobile();
  const [filterType, setFilterType] = useState<'all' | 'rotina' | 'tarefa'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'concluida' | 'pendente' | 'atrasada'>('all');

  // Unificar rotinas e tarefas em uma única lista
  const unifiedActivities: UnifiedActivity[] = useMemo(() => {
    const rotinaActivities: UnifiedActivity[] = rotinas.map(rotina => ({
      id: rotina.id,
      type: 'rotina' as const,
      title: rotina.nome,
      description: rotina.descricao,
      status: rotina.status,
      timestamp: rotina.created_at,
      user: getCachedUserName(rotina.created_by),
      category: rotina.categoria,
      periodicidade: rotina.periodicidade,
      connections: [] // Pode ser expandido para mostrar tarefas relacionadas
    }));

    const tarefaActivities: UnifiedActivity[] = tarefas.map(tarefa => ({
      id: tarefa.id,
      type: 'tarefa' as const,
      title: tarefa.titulo,
      description: tarefa.descricao,
      status: tarefa.status,
      timestamp: tarefa.data_criacao,
      user: getCachedUserName(tarefa.criado_por),
      priority: tarefa.prioridade,
      dueDate: tarefa.data_entrega,
      connections: tarefa.rotina_id ? [tarefa.rotina_id] : []
    }));

    return [...rotinaActivities, ...tarefaActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rotinas, tarefas, getCachedUserName]);

  // Filtrar atividades
  const filteredActivities = useMemo(() => {
    return unifiedActivities.filter(activity => {
      if (filterType !== 'all' && activity.type !== filterType) return false;
      if (filterStatus !== 'all' && activity.status !== filterStatus) return false;
      return true;
    });
  }, [unifiedActivities, filterType, filterStatus]);

  // Agrupar por data
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: UnifiedActivity[] } = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      let dateKey: string;
      
      if (isToday(date)) {
        dateKey = 'Hoje';
      } else if (isYesterday(date)) {
        dateKey = 'Ontem';
      } else if (isTomorrow(date)) {
        dateKey = 'Amanhã';
      } else {
        dateKey = format(date, 'EEEE, dd/MM/yyyy', { locale: ptBR });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'atrasada': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluída</Badge>;
      case 'atrasada': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Atrasada</Badge>;
      default: return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pendente</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'rotina' ? 
      <CheckCircle2 className="h-4 w-4 text-blue-500" /> : 
      <Calendar className="h-4 w-4 text-purple-500" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros e estatísticas */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Rotinas e Tarefas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie todas as suas atividades em um só lugar
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => onCreateNew('rotina')} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Rotina
              </Button>
              <Button onClick={onAddTarefa} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tipo:</span>
              {(['all', 'rotina', 'tarefa'] as const).map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="h-8"
                >
                  {type === 'all' ? 'Todos' : type === 'rotina' ? 'Rotinas' : 'Tarefas'}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {(['all', 'pendente', 'concluida', 'atrasada'] as const).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="h-8"
                >
                  {status === 'all' ? 'Todos' : 
                   status === 'pendente' ? 'Pendentes' :
                   status === 'concluida' ? 'Concluídas' : 'Atrasadas'}
                </Button>
              ))}
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">{rotinas.length}</p>
              <p className="text-xs text-blue-600">Rotinas</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{tarefas.length}</p>
              <p className="text-xs text-purple-600">Tarefas</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">
                {unifiedActivities.filter(a => a.status === 'concluida').length}
              </p>
              <p className="text-xs text-green-600">Concluídas</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-lg font-bold text-red-600">
                {unifiedActivities.filter(a => a.status === 'atrasada').length}
              </p>
              <p className="text-xs text-red-600">Atrasadas</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline de atividades agrupadas por data */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([dateGroup, activities]) => (
          <div key={dateGroup}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
              {dateGroup}
            </h3>
            
            <div className="space-y-3">
              {activities.map((activity) => (
                <Card key={`${activity.type}-${activity.id}`} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Checkbox para marcar como concluída */}
                      <Checkbox
                        checked={activity.status === 'concluida'}
                        onCheckedChange={(checked) => 
                          onStatusChange(activity.id, activity.type, checked ? 'concluida' : 'pendente')
                        }
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Título e tipo */}
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(activity.type)}
                              <span className="font-medium text-gray-900">{activity.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.type === 'rotina' ? 'Rotina' : 'Tarefa'}
                              </Badge>
                            </div>
                            
                            {/* Descrição */}
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            
                            {/* Metadados */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(activity.timestamp)}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.user}
                              </div>
                              
                              {activity.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {activity.category}
                                </Badge>
                              )}
                              
                              {activity.periodicidade && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.periodicidade}
                                </Badge>
                              )}
                              
                              {activity.priority && (
                                <Badge 
                                  variant={activity.priority === 'alta' ? 'destructive' : 'secondary'} 
                                  className="text-xs"
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
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(activity.id, activity.type)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                
                                {activity.type === 'rotina' && (
                                  <DropdownMenuItem onClick={() => onCreateRelated(activity.id, 'rotina', 'tarefa')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Tarefa
                                  </DropdownMenuItem>
                                )}
                                
                                {activity.type === 'tarefa' && (
                                  <DropdownMenuItem onClick={() => onCreateRelated(activity.id, 'tarefa', 'rotina')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Rotina
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
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
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedActivities).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Nenhuma atividade encontrada</h3>
                  <p className="text-muted-foreground">
                    Crie sua primeira rotina ou tarefa para começar.
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button onClick={() => onCreateNew('rotina')} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Rotina
                    </Button>
                    <Button onClick={onAddTarefa}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
