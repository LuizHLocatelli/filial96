import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityFilters as ActivityFiltersType, ActivityItem } from "../types";

interface ActivityFiltersProps {
  filters: ActivityFiltersType;
  activities: ActivityItem[];
  onFilterChange: (key: keyof ActivityFiltersType, value: string) => void;
}

export function ActivityFilters({ filters, activities, onFilterChange }: ActivityFiltersProps) {
  const uniqueUsers = [...new Set(activities.map(a => a.user))];

  return (
    <div className="card-responsive border border-consistent p-4 sm:p-6">
      <div className="stack-md">
        <Input
          placeholder="Buscar por título, usuário..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="input-responsive w-full"
        />
        
        <div className="grid-responsive-cards">
          <Select value={filters.typeFilter} onValueChange={(value) => onFilterChange('typeFilter', value)}>
            <SelectTrigger className="button-responsive">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Tipos</SelectItem>
          <SelectItem value="rotina">Rotina</SelectItem>
          <SelectItem value="tarefa">Tarefa</SelectItem>
          <SelectItem value="orientacao">Orientação</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.actionFilter} onValueChange={(value) => onFilterChange('actionFilter', value)}>
            <SelectTrigger className="button-responsive">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Ações</SelectItem>
              <SelectItem value="criada">Criada</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="atualizada">Atualizada</SelectItem>
              <SelectItem value="deletada">Deletada</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.dateRange} onValueChange={(value) => onFilterChange('dateRange', value)}>
            <SelectTrigger className="button-responsive">
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer Data</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="this_week">Esta Semana</SelectItem>
              <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
              <SelectItem value="this_month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.userFilter} onValueChange={(value) => onFilterChange('userFilter', value)}>
            <SelectTrigger className="button-responsive">
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Usuários</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 