
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
    <div className="flex flex-wrap gap-2 mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
        {(['all', 'rotina', 'tarefa'] as const).map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
            className={cn(
              "h-8",
              filterType === type 
                ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700" 
                : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {type === 'all' ? 'Todos' : type === 'rotina' ? 'Rotinas' : 'Tarefas'}
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        {(['all', 'pendente', 'concluida', 'atrasada'] as const).map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={cn(
              "h-8",
              filterStatus === status 
                ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700" 
                : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {status === 'all' ? 'Todos' : 
             status === 'pendente' ? 'Pendentes' :
             status === 'concluida' ? 'Concluídas' : 'Atrasadas'}
          </Button>
        ))}
      </div>
    </div>
  );
}
