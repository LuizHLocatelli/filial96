import { ProductivityStats, ActivityItem } from '../../types';
import { HubHandlers } from '../../types/hubTypes';
import { useResponsive } from '@/hooks/use-responsive';
import { useLayoutPreferences } from '../../hooks/useLayoutPreferences';
import { StatsOverview } from './StatsOverview';
import { QuickActions } from './QuickActions';
import { ActivityTimeline } from '../unified/ActivityTimeline';
import { CollapsibleSection, CollapsibleGroup } from '../layout/CollapsibleSection';
import { DesktopLayout } from './DesktopLayout';
import { ProductivityAssistant } from '../chatbot/ProductivityAssistant';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

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
      <div className="space-y-4">
        <div className="mb-4">
          <ProductivityAssistant />
        </div>

        <CollapsibleGroup spacing="tight">
          <CollapsibleSection
            title="Estatísticas"
            icon={Activity}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="mobile-stats"
          >
            <div className="px-1">
              <StatsOverview 
                stats={stats} 
                isLoading={isLoading}
                onNavigateToSection={handlers.onNavigateToSection}
              />
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection
            title="Ações Rápidas"
            icon={Zap}
            defaultExpanded={false}
            compact={isCompact}
            persistStateKey="mobile-actions"
          >
            <div className="px-1">
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
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection
            title="Atividades Recentes"
            icon={Clock}
            badge={activities.length}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="mobile-timeline"
          >
            <div className="px-1">
              <ActivityTimeline
                activities={activities}
                isLoading={isLoading}
                maxItems={8}
              />
            </div>
          </CollapsibleSection>
        </CollapsibleGroup>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="space-y-6">
        {/* Assistente de Produtividade - Layout otimizado */}
        <div className="mb-4">
          <ProductivityAssistant />
        </div>

        <CollapsibleGroup spacing={isCompact ? 'tight' : 'normal'}>
          <CollapsibleSection
            title="Visão Geral"
            icon={Activity}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="tablet-stats"
          >
            <div className="px-2">
              <StatsOverview 
                stats={stats} 
                isLoading={isLoading}
                onNavigateToSection={handlers.onNavigateToSection}
              />
            </div>
          </CollapsibleSection>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CollapsibleSection
              title="Ações Rápidas"
              icon={Zap}
              defaultExpanded={true}
              compact={isCompact}
              persistStateKey="tablet-actions"
            >
              <div className="px-2">
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
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection
              title="Timeline de Atividades"
              icon={Clock}
              badge={activities.length}
              defaultExpanded={true}
              compact={isCompact}
              persistStateKey="tablet-timeline"
            >
              <div className="px-2">
                <ActivityTimeline
                  activities={activities}
                  isLoading={isLoading}
                  maxItems={10}
                />
              </div>
            </CollapsibleSection>
          </div>
        </CollapsibleGroup>
      </div>
    );
  }

  // Desktop layout melhorado - Usando componente especializado
  return (
    <DesktopLayout
      stats={stats}
      activities={activities}
      isLoading={isLoading}
      handlers={handlers}
    />
  );
}
