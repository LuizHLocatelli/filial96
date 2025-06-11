import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckSquare, 
  ListTodo, 
  Clock, 
  User, 
  Calendar,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Target,
  Search,
  Filter,
  Plus,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UnifiedActivity {
  id: string;
  type: 'rotina' | 'tarefa';
  title: string;
  description?: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  assignedTo?: string;
  progress?: number;
  tags?: string[];
  relatedItems?: Array<{
    id: string;
    type: 'rotina' | 'tarefa';
    title: string;
  }>;
  estimatedTime?: number; // em minutos
  actualTime?: number; // em minutos
  category?: string;
}

interface UnifiedActivityTimelineProps {
  rotinas: any[];
  tarefas: any[];
  isLoading?: boolean;
  onStatusChange: (id: string, type: 'rotina' | 'tarefa', status: string) => void;
  onEdit: (id: string, type: 'rotina' | 'tarefa') => void;
  onDelete: (id: string, type: 'rotina' | 'tarefa') => void;
  onCreateRelated: (parentId: string, parentType: 'rotina' | 'tarefa', newType: 'rotina' | 'tarefa') => void;
  onCreateNew: (type: 'rotina' | 'tarefa') => void;
  onAddTarefa: () => void;
  getCachedUserName?: (userId: string) => string;
}

const statusConfig = {
  pendente: {
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: Clock,
    label: 'Pendente',
    dotColor: 'bg-amber-400 dark:bg-amber-500'
  },
  em_andamento: {
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: Play,
    label: 'Em Andamento',
    dotColor: 'bg-blue-500 dark:bg-blue-600'
  },
  concluida: {
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
    icon: CheckCircle2,
    label: 'Concluída',
    dotColor: 'bg-green-500 dark:bg-green-600'
  },
  atrasada: {
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: AlertCircle,
    label: 'Atrasada',
    dotColor: 'bg-red-500 dark:bg-red-600'
  }
};

const priorityConfig = {
  baixa: { color: 'bg-gray-400 dark:bg-gray-600', label: 'Baixa', intensity: 1 },
  media: { color: 'bg-yellow-400 dark:bg-yellow-500', label: 'Média', intensity: 2 },
  alta: { color: 'bg-orange-500 dark:bg-orange-600', label: 'Alta', intensity: 3 },
  urgente: { color: 'bg-red-600 dark:bg-red-700', label: 'Urgente', intensity: 4 }
};

const typeConfig = {
  rotina: {
    icon: CheckSquare,
    color: 'text-primary dark:text-primary',
    bgColor: 'bg-primary/5 dark:bg-primary/10',
    borderColor: 'border-primary/20 dark:border-primary/30',
    label: 'Rotina',
    gradient: 'from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10'
  },
  tarefa: {
    icon: ListTodo,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50/50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200/50 dark:border-blue-800/50',
    label: 'Tarefa',
    gradient: 'from-blue-50/50 to-blue-25/25 dark:from-blue-950/40 dark:to-blue-950/20'
  }
};

export function UnifiedActivityTimeline({
  rotinas,
  tarefas,
  isLoading = false,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateRelated,
  onCreateNew,
  onAddTarefa,
  getCachedUserName
}: UnifiedActivityTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  // Converter rotinas e tarefas para formato unificado
  const unifiedActivities = useMemo(() => {
    const activities: UnifiedActivity[] = [];
    
    // Adicionar rotinas
    rotinas.forEach(rotina => {
      const createdAt = rotina.created_at ? new Date(rotina.created_at) : new Date();
      const isValidCreatedAt = !isNaN(createdAt.getTime());
      
      activities.push({
        id: rotina.id,
        type: 'rotina',
        title: rotina.nome,
        description: rotina.descricao,
        status: rotina.concluida ? 'concluida' : 
                rotina.data_conclusao && new Date() > new Date(rotina.data_conclusao) ? 'atrasada' : 'pendente',
        priority: rotina.prioridade || 'media',
        dueDate: rotina.data_conclusao ? new Date(rotina.data_conclusao) : undefined,
        createdAt: isValidCreatedAt ? createdAt : new Date(),
        updatedAt: rotina.updated_at ? new Date(rotina.updated_at) : undefined,
        assignedTo: rotina.user_id,
        category: rotina.categoria,
        estimatedTime: rotina.tempo_estimado,
        tags: rotina.tags || []
      });
    });
    
    // Adicionar tarefas
    tarefas.forEach(tarefa => {
      const createdAt = tarefa.created_at ? new Date(tarefa.created_at) : new Date();
      const isValidCreatedAt = !isNaN(createdAt.getTime());
      
      activities.push({
        id: tarefa.id,
        type: 'tarefa',
        title: tarefa.titulo,
        description: tarefa.descricao,
        status: tarefa.status || 'pendente',
        priority: tarefa.prioridade || 'media',
        dueDate: tarefa.data_entrega ? new Date(tarefa.data_entrega) : undefined,
        createdAt: isValidCreatedAt ? createdAt : new Date(),
        updatedAt: tarefa.updated_at ? new Date(tarefa.updated_at) : undefined,
        assignedTo: tarefa.user_id,
        progress: tarefa.progresso,
        tags: tarefa.tags || []
      });
    });
    
    return activities;
  }, [rotinas, tarefas]);

  // Filtrar e ordenar atividades
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = unifiedActivities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
    
    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const aPriority = priorityConfig[a.priority || 'media'].intensity;
          const bPriority = priorityConfig[b.priority || 'media'].intensity;
          return bPriority - aPriority;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
    
    return filtered;
  }, [unifiedActivities, searchTerm, statusFilter, typeFilter, priorityFilter, sortBy]);

  // Agrupar por data
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: UnifiedActivity[] } = {};
    
    filteredAndSortedActivities.forEach(activity => {
      let groupKey = 'Sem data';
      
      if (activity.dueDate) {
        if (isToday(activity.dueDate)) {
          groupKey = 'Hoje';
        } else if (isTomorrow(activity.dueDate)) {
          groupKey = 'Amanhã';
        } else if (isYesterday(activity.dueDate)) {
          groupKey = 'Ontem';
        } else {
          groupKey = format(activity.dueDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  }, [filteredAndSortedActivities]);

  const handleStatusToggle = (activity: UnifiedActivity) => {
    let newStatus = activity.status;
    if (activity.type === 'rotina') {
        newStatus = activity.status === 'concluida' ? 'pendente' : 'concluida';
    } else if (activity.type === 'tarefa') {
        switch (activity.status) {
            case 'pendente': newStatus = 'em_andamento'; break;
            case 'em_andamento': newStatus = 'concluida'; break;
            case 'concluida': newStatus = 'pendente'; break;
            default: newStatus = 'pendente';
        }
    }
    onStatusChange(activity.id, activity.type, newStatus);
  };

  const getDateGroupOrder = (groupKey: string) => {
    if (groupKey === 'Hoje') return 0;
    if (groupKey === 'Amanhã') return 1;
    if (groupKey === 'Ontem') return 2;
    if (groupKey === 'Sem data') return 99; // Manter sem data por último
    // Para outras datas, ordene pela data real
    const date = filteredAndSortedActivities.find(a => format(a.dueDate!, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) === groupKey)?.dueDate;
    return date ? date.getTime() : 3;
  };

  const sortedGroupKeys = Object.keys(groupedActivities).sort((a, b) => {
    const aDate = getDateGroupOrder(a);
    const bDate = getDateGroupOrder(b);
    return aDate - bDate;
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <Activity className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredAndSortedActivities.length === 0) {
    return (
      <Card className="w-full border-dashed border-muted-foreground/30 bg-muted/20">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <TrendingUp className="h-12 w-12 text-muted-foreground/70 mb-4" />
            <h3 className="text-lg font-semibold text-foreground/90">Tudo em ordem por aqui!</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-2">
              Nenhuma atividade corresponde aos filtros atuais. Que tal criar uma nova?
            </p>
            <div className="mt-6 flex gap-4">
              <Button onClick={() => onCreateNew('tarefa')} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Nova Tarefa
              </Button>
              <Button onClick={() => onCreateNew('rotina')} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Nova Rotina
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Barra de Filtros e Ações */}
      <Card className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar em atividades..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="rotina">Rotinas</SelectItem>
                  <SelectItem value="tarefa">Tarefas</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {/* Additional filters can be added here */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {sortedGroupKeys.map(groupKey => (
        <div key={groupKey}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground"/>
            <h3 className="font-bold text-lg text-foreground">{groupKey}</h3>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-border -translate-x-1/2"></div>
            <div className="space-y-6">
              {groupedActivities[groupKey].map((activity, index) => {
                const TypeIcon = typeConfig[activity.type].icon;
                const StatusIcon = statusConfig[activity.status].icon;
                const config = typeConfig[activity.type];

                return (
                  <motion.div 
                    key={activity.id}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={`absolute top-2.5 left-[-22px] h-4 w-4 rounded-full ${statusConfig[activity.status].dotColor} border-4 border-background`}></div>
                    <Card className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${config.borderColor} ${config.bgColor}`}>
                      <div className={`w-full h-1 bg-gradient-to-r ${config.gradient}`}></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-1.5 rounded-full ${config.bgColor}`}>
                                <TypeIcon className={`h-5 w-5 ${config.color}`} />
                              </div>
                              <h4 className="font-semibold text-md text-foreground">{activity.title}</h4>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground ml-10 mb-3">{activity.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => onEdit(activity.id, activity.type)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleStatusToggle(activity)}>
                                Marcar como {activity.status === 'concluida' ? 'Pendente' : 'Concluída'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => onCreateRelated(activity.id, activity.type, 'tarefa')}>Criar Tarefa Relacionada</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onCreateRelated(activity.id, activity.type, 'rotina')}>Criar Rotina Relacionada</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => onDelete(activity.id, activity.type)} className="text-red-500">
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 ml-10 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5" title="Status">
                            <StatusIcon className="h-3.5 w-3.5" />
                            <span>{statusConfig[activity.status].label}</span>
                          </div>
                          {activity.priority && (
                            <div className="flex items-center gap-1.5" title="Prioridade">
                              <div className={`h-2.5 w-2.5 rounded-full ${priorityConfig[activity.priority].color}`}></div>
                              <span>{priorityConfig[activity.priority].label}</span>
                            </div>
                          )}
                          {activity.assignedTo && getCachedUserName && (
                            <div className="flex items-center gap-1.5" title="Responsável">
                              <User className="h-3.5 w-3.5" />
                              <span>{getCachedUserName(activity.assignedTo)}</span>
                            </div>
                          )}
                           {activity.dueDate && (
                            <div className="flex items-center gap-1.5" title="Data de Vencimento">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{format(activity.dueDate, 'dd/MM/yy', { locale: ptBR })}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 