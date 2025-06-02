
import { useState } from 'react';
import { useHubData } from './hooks/useHubData';
import { useHubFilters } from './hooks/useHubFilters';
import { useHubHandlers } from './hooks/useHubHandlers';
import { useResponsive } from '@/hooks/use-responsive';
import { HubViewMode } from './types';
import { HUB_SECTIONS } from './constants/hubSections';
import { convertToMobileFilters, convertFromMobileFilters } from './utils/filterConversions';
import { HubMobileLayout } from './components/layouts/HubMobileLayout';
import { HubDesktopLayout } from './components/layouts/HubDesktopLayout';

export function HubProdutividade() {
  const [currentSection, setCurrentSection] = useState<HubViewMode>('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de responsividade
  const { isMobile, isTablet } = useResponsive();

  // Hooks para dados e filtros
  const {
    stats,
    activities,
    rotinas,
    orientacoes,
    tarefas,
    isLoading,
    refreshData
  } = useHubData();

  const {
    filters,
    filteredRotinas,
    filteredOrientacoes,
    filteredTarefas,
    filteredActivities,
    filterStats,
    setSearchTerm: setFilterSearchTerm,
    clearFilters
  } = useHubFilters({
    rotinas,
    orientacoes,
    tarefas,
    activities
  });

  // Hook para handlers
  const handlers = useHubHandlers({
    setCurrentSection,
    setSearchTerm,
    setFilterSearchTerm,
    setShowMobileSearch,
    setShowFilters,
    refreshData
  });

  // Configuração das seções com badges
  const sectionsWithBadges = HUB_SECTIONS.map(section => ({
    ...section,
    badge: section.id === 'dashboard' 
      ? (filterStats.hasActiveFilters ? filterStats.total : undefined)
      : section.id === 'rotinas' 
      ? (stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined)
      : section.id === 'orientacoes'
      ? (stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined)
      : section.id === 'tarefas'
      ? (stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined)
      : undefined
  }));

  // Badges para navegação mobile
  const navigationBadges = {
    dashboard: filterStats.hasActiveFilters ? filterStats.total : undefined,
    rotinas: stats.rotinas.atrasadas > 0 ? stats.rotinas.atrasadas : undefined,
    orientacoes: stats.orientacoes.naoLidas > 0 ? stats.orientacoes.naoLidas : undefined,
    tarefas: stats.tarefas.atrasadas > 0 ? stats.tarefas.atrasadas : undefined
  };

  // Conversões de filtros
  const mobileFilters = convertToMobileFilters(searchTerm, filters);
  
  const handleFiltersChange = (newFilters: typeof mobileFilters) => {
    convertFromMobileFilters(newFilters, setSearchTerm, setFilterSearchTerm);
  };

  // Dados para props
  const totalItems = stats.rotinas.total + stats.orientacoes.total + stats.tarefas.total;

  // Layout Mobile
  if (isMobile) {
    return (
      <HubMobileLayout
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        showMobileSearch={showMobileSearch}
        onCloseMobileSearch={() => setShowMobileSearch(false)}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        searchTerm={searchTerm}
        navigationBadges={navigationBadges}
        hasActiveFilters={filterStats.hasActiveFilters}
        totalResults={filterStats.total}
        stats={stats}
        activities={filteredActivities}
        isLoading={isLoading}
        mobileFilters={mobileFilters}
        handlers={handlers}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />
    );
  }

  // Layout Desktop/Tablet
  return (
    <HubDesktopLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      searchTerm={searchTerm}
      sections={sectionsWithBadges}
      hasActiveFilters={filterStats.hasActiveFilters}
      totalResults={filterStats.total}
      totalItems={totalItems}
      stats={stats}
      activities={filteredActivities}
      isLoading={isLoading}
      isTablet={isTablet}
      mobileFilters={mobileFilters}
      handlers={handlers}
      onFiltersChange={handleFiltersChange}
      onClearFilters={clearFilters}
    />
  );
}
