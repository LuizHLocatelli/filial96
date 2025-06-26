import { ProductivityStats } from '../../types';
import { HubHandlers } from '../../types/hubTypes';
import { useResponsive } from '@/hooks/use-responsive';
import { useLayoutPreferences } from '../../hooks/useLayoutPreferences';
import { StatsOverview } from './StatsOverview';
import { CollapsibleSection, CollapsibleGroup } from '../layout/CollapsibleSection';
import { DesktopLayout } from './DesktopLayout';
import { Activity } from 'lucide-react';
import { useEffect } from 'react';
import { ConexoesVisualizacao } from './ConexoesVisualizacao';

interface HubDashboardProps {
  stats: ProductivityStats;
  isLoading: boolean;
  handlers: HubHandlers;
  rotinas?: any[];
  tarefas?: any[];
  onViewRotina?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

export function HubDashboard({
  stats,
  isLoading,
  handlers,
  rotinas = [],
  tarefas = [],
  onViewRotina,
  onViewTarefa
}: HubDashboardProps) {
  const { isMobile, isTablet } = useResponsive();
  const { isCompact } = useLayoutPreferences();

  useEffect(() => {
    if (isMobile) {
      console.log('📱 [MOBILE] HubDashboard renderizando');
      console.log('  🔧 isMobile:', isMobile);
      console.log('  📐 Screen width:', window.innerWidth);
      console.log('  📊 Stats recebidas:', stats);
      console.log('  ⏳ isLoading:', isLoading);
      console.log('  🎯 isCompact:', isCompact);
    }
  }, [isMobile, stats, isLoading, isCompact]);

  useEffect(() => {
    if (isMobile) {
      try {
        localStorage.setItem('collapsible-mobile-stats', JSON.stringify(true));
        console.log('📱 [MOBILE] Forçando expansão das estatísticas');
      } catch (error) {
        console.warn('Erro ao forçar expansão:', error);
      }
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="space-y-4">
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
        </CollapsibleGroup>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="space-y-6">
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
        </CollapsibleGroup>
      </div>
    );
  }

  return (
    <DesktopLayout
      stats={stats}
      isLoading={isLoading}
      handlers={handlers}
      rotinas={rotinas}
      tarefas={tarefas}
      onViewRotina={onViewRotina}
      onViewTarefa={onViewTarefa}
    />
  );
}
