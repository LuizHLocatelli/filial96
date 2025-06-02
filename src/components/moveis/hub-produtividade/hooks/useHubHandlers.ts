import { useState } from 'react';
import { HubViewMode } from '../types';
import { HubHandlers } from '../types/hubTypes';

interface UseHubHandlersProps {
  setCurrentSection: (section: HubViewMode) => void;
  setSearchTerm: (term: string) => void;
  setFilterSearchTerm: (term: string) => void;
  setShowMobileSearch: (show: boolean) => void;
  setShowFilters: (show: boolean) => void;
  refreshData: () => Promise<void>;
}

export function useHubHandlers({
  setCurrentSection,
  setSearchTerm,
  setFilterSearchTerm,
  setShowMobileSearch,
  setShowFilters,
  refreshData
}: UseHubHandlersProps): HubHandlers {
  
  const handleNovaRotina = () => {
    setCurrentSection('rotinas');
    // TODO: Abrir dialog de nova rotina
  };

  const handleNovaOrientacao = () => {
    setCurrentSection('orientacoes');
    // TODO: Abrir dialog de nova orientação
  };

  const handleNovaTarefa = () => {
    setCurrentSection('tarefas');
    // TODO: Abrir dialog de nova tarefa
  };

  const handleExportData = () => {
    // TODO: Implementar exportação
    console.log('Exportar dados...');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilterSearchTerm(term);
  };

  const handleRefreshData = async () => {
    await refreshData();
  };

  const handleShowMobileSearch = () => {
    setShowMobileSearch(true);
  };

  const handleShowFilters = () => {
    setShowFilters(true);
  };

  const handleNavigateToSection = (section: 'dashboard' | 'rotinas' | 'orientacoes' | 'tarefas') => {
    setCurrentSection(section);
  };

  return {
    onNovaRotina: handleNovaRotina,
    onNovaOrientacao: handleNovaOrientacao,
    onNovaTarefa: handleNovaTarefa,
    onExportData: handleExportData,
    onSearch: handleSearch,
    onRefreshData: handleRefreshData,
    onShowMobileSearch: handleShowMobileSearch,
    onShowFilters: handleShowFilters,
    onNavigateToSection: handleNavigateToSection
  };
}
