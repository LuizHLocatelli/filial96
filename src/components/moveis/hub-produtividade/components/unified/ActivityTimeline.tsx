import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, TrendingUp, MoreHorizontal } from 'lucide-react';
import { ActivityItem } from '../../types';
import { ActivityTimelineFilters, ActivityFilters } from './ActivityTimelineFilters';
import { ActivityTimelineItem } from './ActivityTimelineItem';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { isToday, isYesterday, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  isLoading: boolean;
  maxItems?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
  onRefresh?: () => void;
}

export function ActivityTimeline({ 
  activities, 
  isLoading, 
  maxItems = 20,
  showFilters = true,
  onActivityClick,
  onRefresh
}: ActivityTimelineProps) {
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    type: 'all',
    action: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');

  // Filtrar atividades
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          activity.title.toLowerCase().includes(searchTerm) ||
          activity.description?.toLowerCase().includes(searchTerm) ||
          activity.user.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtro de tipo
      if (filters.type !== 'all' && activity.type !== filters.type) {
        return false;
      }

      // Filtro de ação
      if (filters.action !== 'all' && activity.action !== filters.action) {
        return false;
      }

      // Filtro de status
      if (filters.status !== 'all' && activity.status !== filters.status) {
        return false;
      }

      // Filtro de data
      if (filters.dateRange !== 'all') {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();

        switch (filters.dateRange) {
          case 'today':
            if (!isToday(activityDate)) return false;
            break;
          case 'yesterday':
            if (!isYesterday(activityDate)) return false;
            break;
          case 'week':
            if (!isWithinInterval(activityDate, { start: startOfWeek(now), end: now })) {
              return false;
            }
            break;
          case 'month':
            if (!isWithinInterval(activityDate, { start: startOfMonth(now), end: now })) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }, [activities, filters]);

  const displayedActivities = filteredActivities.slice(0, maxItems);

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    const completed = filteredActivities.filter(a => a.status === 'concluida').length;
    const pending = filteredActivities.filter(a => a.status === 'pendente').length;
    const overdue = filteredActivities.filter(a => a.status === 'atrasada').length;

    return { total, completed, pending, overdue };
  }, [filteredActivities]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-2 sm:gap-3 animate-pulse"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-1/2"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Timeline de Atividades</span>
          </CardTitle>
          
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Estatísticas rápidas - melhor responsividade */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              {stats.total > 0 && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {stats.total} total
                </Badge>
              )}
              {stats.completed > 0 && (
                <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100 whitespace-nowrap dark:bg-green-900/30 dark:text-green-400">
                  {stats.completed} concluídas
                </Badge>
              )}
              {stats.overdue > 0 && (
                <Badge className="text-xs bg-red-100 text-red-800 hover:bg-red-100 whitespace-nowrap dark:bg-red-900/30 dark:text-red-400">
                  {stats.overdue} atrasadas
                </Badge>
              )}
            </div>

            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {/* Indicador de progresso - melhor layout mobile */}
        {stats.total > 0 && (
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso geral</span>
              <span className="font-medium">{Math.round((stats.completed / stats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 px-3">
        {/* Filtros */}
        {showFilters && (
          <div className="mb-4">
            <ActivityTimelineFilters
              onFilterChange={setFilters}
              activities={activities}
            />
          </div>
        )}

        {/* Lista de atividades */}
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Activity className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="font-medium text-sm sm:text-base text-muted-foreground mb-2">
              {filters.search || filters.type !== 'all' || filters.action !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                ? 'Nenhuma atividade encontrada'
                : 'Nenhuma atividade recente'
              }
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              {filters.search || filters.type !== 'all' || filters.action !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                ? 'Tente ajustar os filtros para ver mais resultados'
                : 'As atividades aparecerão aqui conforme você usa o sistema'
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)] max-h-[400px] pr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filters.search}-${filters.type}-${filters.action}-${filters.status}-${filters.dateRange}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 pb-2"
              >
                {displayedActivities.map((activity, index) => (
                  <ActivityTimelineItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                    isLast={index === displayedActivities.length - 1}
                    onItemClick={onActivityClick}
                  />
                ))}

                {/* Indicador de mais itens */}
                {filteredActivities.length > maxItems && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-3 sm:py-4 border-t"
                  >
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      Mostrando {displayedActivities.length} de {filteredActivities.length} atividades
                    </p>
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {filteredActivities.length - maxItems} atividades adicionais disponíveis
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
