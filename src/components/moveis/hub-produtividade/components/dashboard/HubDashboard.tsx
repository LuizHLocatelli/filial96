import { ProductivityStats, ActivityItem } from '../../types';
import { HubHandlers } from '../../types/hubTypes';
import { useResponsive } from '@/hooks/use-responsive';
import { useLayoutPreferences } from '../../hooks/useLayoutPreferences';
import { StatsOverview } from './StatsOverview';
import { QuickActions } from './QuickActions';
import { ActivityTimeline } from '../unified/ActivityTimeline';
import { CollapsibleSection, CollapsibleGroup } from '../layout/CollapsibleSection';
import { Activity, Zap, Clock } from 'lucide-react';

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
  const { preferences, layoutConfig, isCompact } = useLayoutPreferences();

  if (isMobile) {
    return (
      <CollapsibleGroup spacing="tight">
        <CollapsibleSection
          title="Estatísticas"
          icon={Activity}
          defaultExpanded={true}
          compact={isCompact}
          persistStateKey="mobile-stats"
        >
          <StatsOverview 
            stats={stats} 
            isLoading={isLoading}
            onNavigateToSection={handlers.onNavigateToSection}
          />
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Ações Rápidas"
          icon={Zap}
          defaultExpanded={false}
          compact={isCompact}
          persistStateKey="mobile-actions"
        >
          <QuickActions
            onNovaRotina={handlers.onNovaRotina}
            onNovaOrientacao={handlers.onNovaOrientacao}
            onNovaTarefa={handlers.onNovaTarefa}
            onRefreshData={handlers.onRefreshData}
            onExportData={handlers.onExportData}
            onShowFilters={handlers.onShowFilters}
            onBuscaAvancada={handlers.onBuscaAvancada || (() => {})}
            onFiltrosPorData={handlers.onFiltrosPorData || (() => {})}
            onRelatorios={handlers.onRelatorios || (() => {})}
            isRefreshing={isLoading}
          />
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Atividades Recentes"
          icon={Clock}
          badge={activities.length}
          defaultExpanded={true}
          compact={isCompact}
          persistStateKey="mobile-timeline"
        >
          <ActivityTimeline
            activities={activities}
            isLoading={isLoading}
            maxItems={8}
          />
        </CollapsibleSection>
      </CollapsibleGroup>
    );
  }

  if (isTablet) {
    return (
      <CollapsibleGroup spacing={isCompact ? 'tight' : 'normal'}>
        <CollapsibleSection
          title="Visão Geral"
          icon={Activity}
          defaultExpanded={true}
          compact={isCompact}
          persistStateKey="tablet-stats"
        >
          <StatsOverview 
            stats={stats} 
            isLoading={isLoading}
            onNavigateToSection={handlers.onNavigateToSection}
          />
        </CollapsibleSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CollapsibleSection
            title="Ações Rápidas"
            icon={Zap}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="tablet-actions"
          >
            <QuickActions
              onNovaRotina={handlers.onNovaRotina}
              onNovaOrientacao={handlers.onNovaOrientacao}
              onNovaTarefa={handlers.onNovaTarefa}
              onRefreshData={handlers.onRefreshData}
              onExportData={handlers.onExportData}
              onShowFilters={handlers.onShowFilters}
              onBuscaAvancada={handlers.onBuscaAvancada || (() => {})}
              onFiltrosPorData={handlers.onFiltrosPorData || (() => {})}
              onRelatorios={handlers.onRelatorios || (() => {})}
              isRefreshing={isLoading}
            />
          </CollapsibleSection>
          
          <CollapsibleSection
            title="Timeline de Atividades"
            icon={Clock}
            badge={activities.length}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="tablet-timeline"
          >
            <ActivityTimeline
              activities={activities}
              isLoading={isLoading}
              maxItems={10}
            />
          </CollapsibleSection>
        </div>
      </CollapsibleGroup>
    );
  }

  // Desktop layout - Melhor aproveitamento horizontal com seções colapsáveis
  return (
    <CollapsibleGroup spacing={layoutConfig.spacing.replace('space-y-', '') as 'tight' | 'normal' | 'relaxed'}>
      {/* Stats em toda a largura - sempre visível */}
      <StatsOverview 
        stats={stats} 
        isLoading={isLoading}
        onNavigateToSection={handlers.onNavigateToSection}
      />
      
      {/* Layout horizontal otimizado com seções colapsáveis */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Área principal - Timeline expandida */}
        <div className="xl:col-span-2">
          <CollapsibleSection
            title="Atividades Recentes"
            icon={Clock}
            badge={activities.length}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="desktop-timeline"
          >
            <ActivityTimeline
              activities={activities}
              isLoading={isLoading}
              maxItems={15}
            />
          </CollapsibleSection>
        </div>
        
        {/* Sidebar compacta - Quick Actions */}
        <div className="xl:col-span-1">
          <CollapsibleSection
            title="Ações Rápidas"
            icon={Zap}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="desktop-actions"
          >
            <QuickActions
              onNovaRotina={handlers.onNovaRotina}
              onNovaOrientacao={handlers.onNovaOrientacao}
              onNovaTarefa={handlers.onNovaTarefa}
              onRefreshData={handlers.onRefreshData}
              onExportData={handlers.onExportData}
              onShowFilters={handlers.onShowFilters}
              onBuscaAvancada={handlers.onBuscaAvancada || (() => {})}
              onFiltrosPorData={handlers.onFiltrosPorData || (() => {})}
              onRelatorios={handlers.onRelatorios || (() => {})}
              isRefreshing={isLoading}
            />
          </CollapsibleSection>
        </div>
      </div>
    </CollapsibleGroup>
  );
}
