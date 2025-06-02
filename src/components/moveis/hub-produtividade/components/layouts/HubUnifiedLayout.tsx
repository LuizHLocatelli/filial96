import { useState } from 'react';
import { HubViewMode, ProductivityStats } from '../../types';
import { ActivityItem } from '../../types';
import { NavigationBadges, HubHandlers } from '../../types/hubTypes';
import { HubHeaderNavigation } from '../navigation/HubHeaderNavigation';
import { HubDashboard } from '../dashboard/HubDashboard';
import { Rotinas } from '../../../rotinas/Rotinas';
import { VmTarefas } from '../../../orientacoes/Orientacoes';
import { OrientacaoTarefas } from '../../../orientacoes/OrientacaoTarefas';
import OrientacoesMonitoramento from '../OrientacoesMonitoramento';
import { Relatorios } from '../funcionalidades/Relatorios';

interface HubUnifiedLayoutProps {
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

export function HubUnifiedLayout({
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
}: HubUnifiedLayoutProps) {
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);
  const [showRelatorios, setShowRelatorios] = useState(false);

  const handleBuscaAvancada = () => setShowBuscaAvancada(true);
  const handleFiltrosPorData = () => setShowFiltrosPorData(true);
  const handleRelatorios = () => setShowRelatorios(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Navegação */}
      <HubHeaderNavigation
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        badges={navigationBadges}
      />

      {/* Conteúdo Principal */}
      <div className="px-3 sm:px-4 lg:px-6 py-4">
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

        {currentSection === 'tarefas' && (
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <OrientacaoTarefas />
          </div>
        )}
      </div>

      {/* Modais e Dialogs */}
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