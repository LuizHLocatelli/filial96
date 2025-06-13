
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
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse dark:bg-gray-800/50 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
      <Card className="dark:bg-gray-800/50 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Rotinas e Tarefas
              </CardTitle>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                Gerencie todas as suas atividades em um só lugar
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => onCreateNew('rotina')} 
                variant="outline" 
                size="sm"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Rotina
              </Button>
              <Button 
                onClick={onAddTarefa} 
                size="sm"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
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
        </CardHeader>
      </Card>

      {/* Timeline de atividades agrupadas por data */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([dateGroup, activities]) => (
          <div key={dateGroup}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 capitalize">
              {dateGroup}
            </h3>
            
            <div className="space-y-3">
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
