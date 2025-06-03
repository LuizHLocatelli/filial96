
import { useState } from 'react';
import { HubViewMode, ProductivityStats } from '../../types';
import { ActivityItem } from '../../types';
import { NavigationBadges, HubHandlers } from '../../types/hubTypes';
import { MobileNavigation } from '../mobile/MobileNavigation';
import { HubDashboard } from '../dashboard/HubDashboard';
import { Rotinas } from '../../../rotinas/Rotinas';
import { VmTarefas } from '../../../orientacoes/Orientacoes';
import OrientacoesMonitoramento from '../OrientacoesMonitoramento';
import { Relatorios } from '../funcionalidades/Relatorios';

interface HubMobileLayoutProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  navigationBadges: NavigationBadges;
  stats: ProductivityStats;
  activities: ActivityItem[];
  isLoading: boolean;
  handlers: HubHandlers;
  rotinas?: Array<any>;
  orientacoes?: Array<any>;
  tarefas?: Array<any>;
}

export function HubMobileLayout({
  currentSection,
  onSectionChange,
  navigationBadges,
  stats,
  activities,
  isLoading,
  handlers,
  rotinas = [],
  orientacoes = [],
  tarefas = []
}: HubMobileLayoutProps) {
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);
  const [showRelatorios, setShowRelatorios] = useState(false);

  const handleBuscaAvancada = () => setShowBuscaAvancada(true);
  const handleFiltrosPorData = () => setShowFiltrosPorData(true);
  const handleRelatorios = () => setShowRelatorios(true);

  const handleSearchResults = (results: any) => {
    console.log('Resultados da busca avançada (mobile):', results);
  };

  const handleDateFilters = (filters: any) => {
    console.log('Filtros por data aplicados (mobile):', filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        badges={navigationBadges}
        hasActiveFilters={false}
      />

      <div className="px-3 py-4">
        {currentSection === 'dashboard' && (
          <HubDashboard
            stats={stats}
            activities={activities}
            isLoading={isLoading}
            handlers={{
              ...handlers,
              onBuscaAvancada: handleBuscaAvancada,
              onFiltrosPorData: handleFiltrosPorData,
              onRelatorios: handleRelatorios
            }}
          />
        )}

        {currentSection === 'rotinas' && (
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <Rotinas />
          </div>
        )}

        {currentSection === 'orientacoes' && (
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <VmTarefas />
          </div>
        )}

        {currentSection === 'monitoramento' && (
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <OrientacoesMonitoramento />
          </div>
        )}
      </div>

      <Relatorios
        open={showRelatorios}
        onOpenChange={setShowRelatorios}
        rotinas={rotinas}
        orientacoes={orientacoes}
        tarefas={tarefas}
        stats={stats}
      />
    </div>
  );
}
