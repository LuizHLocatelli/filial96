import { useState } from 'react';
import { useHubData } from './hooks/useHubData';
import { useHubHandlers } from './hooks/useHubHandlers';
import { HubViewMode } from './types';
import { HUB_SECTIONS } from './constants/hubSections';
import { HubUnifiedLayout } from './components/layouts/HubUnifiedLayout';

export function HubProdutividade() {
  // Estados locais
  const [currentSection, setCurrentSection] = useState<HubViewMode>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSearchTerm, setFilterSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hooks para dados
  const {
    stats,
    activities,
    rotinas,
    orientacoes,
    tarefas,
    isLoading,
    refreshData
  } = useHubData();

  // Hook para handlers
  const handlers = useHubHandlers({
    setCurrentSection,
    setSearchTerm,
    setFilterSearchTerm,
    setShowMobileSearch,
    setShowFilters,
    refreshData
  });

  // Badges para navegação
  const navigationBadges = {
    dashboard: undefined,
    rotinas: stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined,
    orientacoes: stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined,
    monitoramento: undefined,
    tarefas: stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined
  };

  // Sempre usar o layout unificado com navegação na header
  return (
    <HubUnifiedLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      navigationBadges={navigationBadges}
      stats={stats}
      activities={activities}
      isLoading={isLoading}
      handlers={handlers}
      rotinas={rotinas}
      orientacoes={orientacoes}
      tarefas={tarefas}
    />
  );
}
