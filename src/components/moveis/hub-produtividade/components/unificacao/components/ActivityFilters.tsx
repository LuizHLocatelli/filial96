
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface ActivityFiltersProps {
  filterType: 'all' | 'rotina' | 'tarefa';
  setFilterType: (type: 'all' | 'rotina' | 'tarefa') => void;
  filterStatus: 'all' | 'concluida' | 'pendente' | 'atrasada';
  setFilterStatus: (status: 'all' | 'concluida' | 'pendente' | 'atrasada') => void;
}

export function ActivityFilters({
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus
}: ActivityFiltersProps) {
  return (
    <div className="space-y-3 mt-4">
      {/* Filtros de Tipo */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Tipo
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'rotina', 'tarefa'] as const).map(type => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
              className={cn(
                "h-7 px-3 text-xs font-medium transition-all duration-200",
                filterType === type 
                  ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 shadow-sm" 
                  : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:border-green-300 hover:text-green-700 dark:hover:border-green-600"
              )}
            >
              {type === 'all' ? 'Todos' : type === 'rotina' ? 'Rotinas' : 'Tarefas'}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Filtros de Status */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Status
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pendente', 'concluida', 'atrasada'] as const).map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={cn(
                "h-7 px-3 text-xs font-medium transition-all duration-200",
                filterStatus === status 
                  ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 shadow-sm" 
                  : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:border-green-300 hover:text-green-700 dark:hover:border-green-600"
              )}
            >
              {status === 'all' ? 'Todos' : 
               status === 'pendente' ? 'Pendentes' :
               status === 'concluida' ? 'Concluídas' : 'Atrasadas'}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
