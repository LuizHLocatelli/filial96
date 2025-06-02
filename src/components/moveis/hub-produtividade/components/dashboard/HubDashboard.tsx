
import { ProductivityStats, ActivityItem } from '../../types';
import { HubHandlers } from '../../types/hubTypes';
import { useResponsive } from '@/hooks/use-responsive';
import { StatsOverview } from './StatsOverview';
import { QuickActions } from './QuickActions';
import { ActivityTimeline } from '../unified/ActivityTimeline';

interface HubDashboardProps {
  stats: ProductivityStats;
  activities: ActivityItem[];
  isLoading: boolean;
  handlers: HubHandlers;
}

export function HubDashboard({
  stats,
  activities,
  isLoading,
  handlers
}: HubDashboardProps) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return (
      <div className="space-y-4">
        <StatsOverview stats={stats} isLoading={isLoading} />
        
        <QuickActions
          onNovaRotina={handlers.onNovaRotina}
          onNovaOrientacao={handlers.onNovaOrientacao}
          onNovaTarefa={handlers.onNovaTarefa}
          onRefreshData={handlers.onRefreshData}
          onExportData={handlers.onExportData}
          onShowFilters={handlers.onShowFilters}
          isRefreshing={isLoading}
        />
        
        <ActivityTimeline
          activities={activities}
          isLoading={isLoading}
          maxItems={8}
        />
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="space-y-6">
        <StatsOverview stats={stats} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions
            onNovaRotina={handlers.onNovaRotina}
            onNovaOrientacao={handlers.onNovaOrientacao}
            onNovaTarefa={handlers.onNovaTarefa}
            onRefreshData={handlers.onRefreshData}
            onExportData={handlers.onExportData}
            onShowFilters={handlers.onShowFilters}
            isRefreshing={isLoading}
          />
          
          <ActivityTimeline
            activities={activities}
            isLoading={isLoading}
            maxItems={10}
          />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <StatsOverview stats={stats} isLoading={isLoading} />
      </div>
      
      <div className="space-y-6">
        <QuickActions
          onNovaRotina={handlers.onNovaRotina}
          onNovaOrientacao={handlers.onNovaOrientacao}
          onNovaTarefa={handlers.onNovaTarefa}
          onRefreshData={handlers.onRefreshData}
          onExportData={handlers.onExportData}
          onShowFilters={handlers.onShowFilters}
          isRefreshing={isLoading}
        />
        
        <ActivityTimeline
          activities={activities}
          isLoading={isLoading}
          maxItems={10}
        />
      </div>
    </div>
  );
}
