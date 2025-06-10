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
import { Activity, Zap, Clock, TrendingUp, Link2 } from 'lucide-react';
import { useEffect } from 'react';
import { ConexoesVisualizacao } from './ConexoesVisualizacao';
import { adaptProductivityStatsToStatsData } from '../../utils/statsAdapter';

interface HubDashboardProps {
  stats: ProductivityStats;
  activities: ActivityItem[];
  isLoading: boolean;
  handlers: HubHandlers;
  rotinas?: any[];
  tarefas?: any[];
  onViewRotina?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

export function HubDashboard({
  stats,
  activities,
  isLoading,
  handlers,
  rotinas = [],
  tarefas = [],
  onViewRotina,
  onViewTarefa
}: HubDashboardProps) {
  const { isMobile, isTablet } = useResponsive();
  const { preferences, layoutConfig, isCompact } = useLayoutPreferences();

  // Adaptar stats para o formato esperado pelo StatsOverview
  const adaptedStats = adaptProductivityStatsToStatsData(stats);

  // Debug logs para mobile
  useEffect(() => {
    if (isMobile) {
      console.log('📱 [MOBILE] HubDashboard renderizando');
      console.log('  🔧 isMobile:', isMobile);
      console.log('  📐 Screen width:', window.innerWidth);
      console.log('  📊 Stats recebidas:', stats);
      console.log('  ⏳ isLoading:', isLoading);
      console.log('  🎯 isCompact:', isCompact);
      console.log('  ⚙️ preferences:', preferences);
    }
  }, [isMobile, stats, isLoading, isCompact, preferences]);

  // Garantir que as seções importantes estejam sempre expandidas no mobile
  useEffect(() => {
    if (isMobile) {
      // Forçar expansão da seção de estatísticas no mobile
      try {
        localStorage.setItem('collapsible-mobile-stats', JSON.stringify(true));
        console.log('📱 [MOBILE] Forçando expansão das estatísticas');
      } catch (error) {
        console.warn('Erro ao forçar expansão:', error);
      }
    }
  }, [isMobile]);

  if (isMobile) {
    console.log('📱 [MOBILE DEBUG] Renderizando versão mobile do HubDashboard');
    
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
                stats={adaptedStats} 
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
            title="Conexões Rotinas ↔ Tarefas"
            icon={Link2}
            defaultExpanded={false}
            compact={isCompact}
            persistStateKey="mobile-connections"
          >
            <div className="px-1">
              <ConexoesVisualizacao
                rotinas={rotinas}
                tarefas={tarefas}
                onViewRotina={onViewRotina}
                onViewTarefa={onViewTarefa}
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
                stats={adaptedStats} 
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
          
          <CollapsibleSection
            title="Mapa de Conexões"
            icon={Link2}
            defaultExpanded={true}
            compact={isCompact}
            persistStateKey="tablet-connections"
          >
            <div className="px-2">
              <ConexoesVisualizacao
                rotinas={rotinas}
                tarefas={tarefas}
                onViewRotina={onViewRotina}
                onViewTarefa={onViewTarefa}
              />
            </div>
          </CollapsibleSection>
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
      rotinas={rotinas}
      tarefas={tarefas}
      onViewRotina={onViewRotina}
      onViewTarefa={onViewTarefa}
    />
  );
}
