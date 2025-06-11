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
          groupKey = format(activity.dueDate, 'EEEE, dd/MM/yyyy', { locale: ptBR });
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
    const nextStatus = activity.status === 'concluida' ? 'pendente' : 
                      activity.status === 'pendente' ? 'em_andamento' : 'concluida';
    onStatusChange(activity.id, activity.type, nextStatus);
  };

  const getDateGroupOrder = (groupKey: string) => {
    if (groupKey === 'Hoje') return 0;
    if (groupKey === 'Amanhã') return 1;
    if (groupKey === 'Ontem') return -1;
    if (groupKey === 'Sem data') return 999;
    return 2;
  };

  const sortedGroupKeys = Object.keys(groupedActivities).sort((a, b) => {
    return getDateGroupOrder(a) - getDateGroupOrder(b);
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
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
      {/* Header com estatísticas e controles */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-50/50 dark:from-primary/10 dark:to-blue-950/30">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Central de Atividades</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Rotinas e Tarefas unificadas em uma timeline inteligente
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto mb-2 sm:mb-3">
                <Button
                  onClick={() => onCreateNew('rotina')}
                  size="sm"
                  variant="outline"
                  className="gap-2 w-full xs:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-2 min-h-[40px] sm:min-h-[36px] touch-manipulation"
                >
                  <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Nova Rotina
                </Button>
                <Button
                  onClick={onAddTarefa}
                  size="sm"
                  variant="gradient"
                  className="gap-2 w-full xs:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-2 min-h-[40px] sm:min-h-[36px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl border-0 touch-manipulation"
                >
                  <ListTodo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Nova Tarefa
                </Button>
              </div>
            </div>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 text-center border border-border/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1">
                {unifiedActivities.filter(a => a.status === 'pendente').length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Pendentes</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 text-center border border-border/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {unifiedActivities.filter(a => a.status === 'em_andamento').length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Em Andamento</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 text-center border border-border/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {unifiedActivities.filter(a => a.status === 'concluida').length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Concluídas</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 text-center border border-border/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                {unifiedActivities.filter(a => a.status === 'atrasada').length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Atrasadas</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="rotina">Rotinas</SelectItem>
                  <SelectItem value="tarefa">Tarefas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Data</SelectItem>
                  <SelectItem value="priority">Prioridade</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de atividades */}
      <div className="space-y-6">
        <AnimatePresence>
          {sortedGroupKeys.map((groupKey) => {
            const activities = groupedActivities[groupKey];
            
            return (
              <motion.div
                key={groupKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Cabeçalho do grupo */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                  <Badge variant="outline" className="px-3 py-1 font-medium">
                    {groupKey} ({activities.length})
                  </Badge>
                  <div className="h-px bg-gradient-to-l from-border to-transparent flex-1" />
                </div>
                
                {/* Atividades do grupo */}
                <div className="space-y-3">
                  {activities.map((activity, index) => {
                    const TypeIcon = typeConfig[activity.type].icon;
                    const StatusIcon = statusConfig[activity.status].icon;
                    const isOverdue = activity.dueDate && new Date() > activity.dueDate && activity.status !== 'concluida';
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        {/* Linha conectora */}
                        {index < activities.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-border/50 to-transparent" />
                        )}
                        
                        <Card className={`
                          relative transition-all duration-300 hover:shadow-lg sm:hover:scale-[1.02]
                          ${activity.status === 'concluida' ? 'opacity-75' : ''}
                          ${isOverdue ? 'ring-2 ring-red-200 dark:ring-red-800 bg-red-50/30 dark:bg-red-950/20' : ''}
                          ${typeConfig[activity.type].bgColor}
                          border-l-4 ${activity.type === 'rotina' ? 'border-l-primary dark:border-l-primary' : 'border-l-blue-500 dark:border-l-blue-400'}
                        `}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3 sm:gap-4">
                              {/* Indicador de tipo e status */}
                              <div className="relative flex-shrink-0">
                                <div className={`
                                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                                  bg-gradient-to-br ${typeConfig[activity.type].gradient}
                                  border-2 border-background shadow-sm
                                `}>
                                  <TypeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${typeConfig[activity.type].color}`} />
                                </div>
                                
                                {/* Indicador de status */}
                                <div className={`
                                  absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full
                                  flex items-center justify-center border-2 border-background
                                  ${statusConfig[activity.status].color}
                                `}>
                                  <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </div>
                              </div>

                              {/* Conteúdo */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                      <h3 className={`
                                        font-semibold text-sm sm:text-base
                                        ${activity.status === 'concluida' ? 'line-through text-muted-foreground' : 'text-foreground'}
                                      `}>
                                        {activity.title}
                                      </h3>
                                      
                                      <div className="flex items-center gap-2">
                                        {/* Badge de tipo */}
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs px-2 py-0 ${typeConfig[activity.type].color}`}
                                        >
                                          {typeConfig[activity.type].label}
                                        </Badge>
                                        
                                        {/* Indicador de prioridade */}
                                        {activity.priority && (
                                          <div className={`
                                            w-2 h-2 rounded-full ${priorityConfig[activity.priority].color}
                                          `} title={`Prioridade: ${priorityConfig[activity.priority].label}`} />
                                        )}
                                      </div>
                                      
                                      {/* Badge de urgência */}
                                      {isOverdue && (
                                        <Badge variant="destructive" className="text-xs px-2 py-0">
                                          Atrasada
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {activity.description && (
                                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                        {activity.description}
                                      </p>
                                    )}
                                    
                                    {/* Barra de progresso para tarefas */}
                                    {activity.type === 'tarefa' && activity.progress !== undefined && (
                                      <div className="mb-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                          <span>Progresso</span>
                                          <span>{activity.progress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5 sm:h-3">
                                          <div 
                                            className="bg-primary h-2.5 sm:h-3 rounded-full transition-all duration-300 shadow-sm"
                                            style={{ width: `${activity.progress}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Meta informações */}
                                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground mt-3">
                                      {activity.assignedTo && getCachedUserName && (
                                        <div className="flex items-center gap-1.5">
                                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                          <span className="font-medium">{getCachedUserName(activity.assignedTo)}</span>
                                        </div>
                                      )}
                                      
                                      {activity.dueDate && (
                                        <div className={`flex items-center gap-1.5 ${
                                          isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''
                                        }`}>
                                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                          <span className="font-medium">
                                            {format(activity.dueDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                          </span>
                                          {isOverdue && <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="font-medium">
                                          {activity.createdAt && !isNaN(activity.createdAt.getTime()) 
                                            ? format(activity.createdAt, 'dd/MM HH:mm', { locale: ptBR })
                                            : 'Data inválida'
                                          }
                                        </span>
                                      </div>
                                      
                                      {activity.estimatedTime && (
                                        <div className="flex items-center gap-1.5">
                                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                          <span className="font-medium">{activity.estimatedTime}min</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Tags */}
                                    {activity.tags && activity.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {activity.tags.map((tag, tagIndex) => (
                                          <Badge key={tagIndex} variant="secondary" className="text-xs px-2 py-0">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Ações */}
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStatusToggle(activity)}
                                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                                      title={`Marcar como ${activity.status === 'concluida' ? 'pendente' : 'concluída'}`}
                                    >
                                      {activity.status === 'concluida' ? (
                                        <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                                      ) : (
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      )}
                                    </Button>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation">
                                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(activity.id, activity.type)}>
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => onCreateRelated(activity.id, activity.type, activity.type === 'rotina' ? 'tarefa' : 'rotina')}
                                        >
                                          <Target className="h-4 w-4 mr-2" />
                                          Criar {activity.type === 'rotina' ? 'Tarefa' : 'Rotina'} Relacionada
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => onCreateRelated(activity.id, activity.type, 'tarefa')}
                                        >
                                          <Zap className="h-4 w-4 mr-2" />
                                          Ação Rápida
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => onDelete(activity.id, activity.type)}
                                          className="text-destructive"
                                        >
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
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredAndSortedActivities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros ou criar uma nova atividade.'
                  : 'Comece criando sua primeira rotina ou tarefa!'}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button onClick={() => onCreateNew('rotina')} variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-4 py-2">
                  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Nova Rotina
                </Button>
                <Button 
                  onClick={onAddTarefa} 
                  size="sm"
                  variant="gradient"
                  className="w-full sm:w-auto text-xs sm:text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl border-0"
                >
                  <ListTodo className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}