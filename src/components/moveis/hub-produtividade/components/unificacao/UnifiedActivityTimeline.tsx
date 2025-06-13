
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

// New components
import { useUnifiedActivities } from './hooks/useUnifiedActivities';
import { ActivityFilters } from './components/ActivityFilters';
import { ActivityStatistics } from './components/ActivityStatistics';
import { ActivityCard } from './components/ActivityCard';
import { TimelineEmptyState } from './components/TimelineEmptyState';

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
  const [filterType, setFilterType] = useState<'all' | 'rotina' | 'tarefa'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'concluida' | 'pendente' | 'atrasada'>('all');

  const { unifiedActivities, groupedActivities } = useUnifiedActivities({
    rotinas,
    tarefas,
    getCachedUserName,
    filterType,
    filterStatus
  });

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse dark:bg-gray-800/50 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabeçalho com filtros e estatísticas */}
      <Card className="dark:bg-gray-800/50 dark:border-gray-700">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Rotinas e Tarefas
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  Gerencie todas as suas atividades em um só lugar
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button 
                  onClick={() => onCreateNew('rotina')} 
                  variant="outline" 
                  size="sm"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Nova Rotina
                </Button>
                <Button 
                  onClick={onAddTarefa} 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Nova Tarefa
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <ActivityFilters
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />

            {/* Estatísticas rápidas */}
            <ActivityStatistics
              rotinasCount={rotinas.length}
              tarefasCount={tarefas.length}
              concluidasCount={unifiedActivities.filter(a => a.status === 'concluida').length}
              atrasadasCount={unifiedActivities.filter(a => a.status === 'atrasada').length}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Timeline de atividades agrupadas por data */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedActivities).map(([dateGroup, activities]) => (
          <div key={dateGroup} className="space-y-2 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize px-1">
              {dateGroup}
            </h3>
            
            <div className="space-y-2 sm:space-y-3">
              {activities.map((activity) => (
                <ActivityCard
                  key={`${activity.type}-${activity.id}`}
                  activity={activity}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCreateRelated={onCreateRelated}
                />
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedActivities).length === 0 && (
          <TimelineEmptyState
            onCreateNew={onCreateNew}
            onAddTarefa={onAddTarefa}
          />
        )}
      </div>
    </div>
  );
}
