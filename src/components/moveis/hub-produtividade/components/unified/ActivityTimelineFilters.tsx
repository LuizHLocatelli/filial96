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
    <div className="space-y-2 p-2 bg-muted/20 rounded-md border border-muted/50">
      {/* Header ultra compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-2xs font-medium">Filtros</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-3xs px-1 py-0 h-3 leading-none">
              {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-6 w-6 p-0"
          >
            {showAdvanced ? 
              <ChevronUp className="h-3 w-3" /> : 
              <ChevronDown className="h-3 w-3" />
            }
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Busca minimalista */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-6 h-7 text-2xs placeholder:text-2xs border-muted/50"
        />
      </div>

      {/* Filtros compactos */}
      {showAdvanced && (
        <div className="space-y-2">
          {/* Layout mobile first - sempre em grid 2x2 */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Tipo */}
            <div>
              <label className="text-3xs font-medium text-muted-foreground mb-0.5 block">
                Tipo
              </label>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger className="h-6 text-3xs border-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-3xs">Todos</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-3xs">
                      {type === 'rotina' ? 'Rotinas' : 
                       type === 'orientacao' ? 'Orientações' : 
                       type === 'tarefa' ? 'Tarefas' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-3xs font-medium text-muted-foreground mb-0.5 block">
                Status
              </label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="h-6 text-3xs border-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-3xs">Todos</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status} className="text-3xs">
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
            <div>
              <label className="text-3xs font-medium text-muted-foreground mb-0.5 block">
                Ação
              </label>
              <Select value={filters.action} onValueChange={(value) => updateFilter('action', value)}>
                <SelectTrigger className="h-6 text-3xs border-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-3xs">Todas</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action} className="text-3xs">
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
            <div>
              <label className="text-3xs font-medium text-muted-foreground mb-0.5 block">
                Período
              </label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger className="h-6 text-3xs border-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-3xs">Todos</SelectItem>
                  <SelectItem value="today" className="text-3xs">Hoje</SelectItem>
                  <SelectItem value="yesterday" className="text-3xs">Ontem</SelectItem>
                  <SelectItem value="week" className="text-3xs">Semana</SelectItem>
                  <SelectItem value="month" className="text-3xs">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
