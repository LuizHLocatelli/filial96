import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ActivityItem } from '../../types';
import { cn } from '@/lib/utils';

interface ActivityTimelineFiltersProps {
  onFilterChange: (filters: ActivityFilters) => void;
  activities: ActivityItem[];
}

export interface ActivityFilters {
  search: string;
  type: string;
  action: string;
  status: string;
  dateRange: string;
}

export function ActivityTimelineFilters({ onFilterChange, activities }: ActivityTimelineFiltersProps) {
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    type: 'all',
    action: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof ActivityFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: ActivityFilters = {
      search: '',
      type: 'all',
      action: 'all',
      status: 'all',
      dateRange: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  // Extrair valores únicos para os filtros
  const uniqueTypes = [...new Set(activities.map(a => a.type))];
  const uniqueActions = [...new Set(activities.map(a => a.action))];
  const uniqueStatuses = [...new Set(activities.map(a => a.status))];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Cabeçalho compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium">Filtros</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-5 px-2 text-xs whitespace-nowrap">
              {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs whitespace-nowrap"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Campo de busca minimalista */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar atividades..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Filtros avançados em layout responsivo */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tipo</label>
          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'rotina' ? 'Rotinas' : 
                   type === 'orientacao' ? 'Orientações' : 
                   type === 'tarefa' ? 'Tarefas' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status</label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'concluida' ? 'OK' :
                   status === 'pendente' ? 'Pendente' :
                   status === 'atrasada' ? 'Atrasada' :
                   status === 'nova' ? 'Nova' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ação */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Ação</label>
          <Select value={filters.action} onValueChange={(value) => updateFilter('action', value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>
                  {action === 'criada' ? 'Criou' :
                   action === 'concluida' ? 'Concluiu' :
                   action === 'atualizada' ? 'Atualizou' :
                   action === 'deletada' ? 'Removeu' : action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Período</label>
          <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
