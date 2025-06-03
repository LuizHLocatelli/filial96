import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  const handleNovaRotina = () => {
    // Navegar para a tab de rotinas e tentar abrir o dialog de criação
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'rotinas');
    currentUrl.searchParams.set('action', 'new');
    navigate(currentUrl.pathname + currentUrl.search);
    setCurrentSection('rotinas');
  };

  const handleNovaOrientacao = () => {
    // Navegar para a tab de orientações e tentar abrir o dialog de criação
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'orientacoes');
    currentUrl.searchParams.set('action', 'new');
    navigate(currentUrl.pathname + currentUrl.search);
    setCurrentSection('orientacoes');
  };

  const handleNovaTarefa = () => {
    // Navegar para a tab de orientações (onde estão as tarefas) e abrir dialog de criação
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'orientacoes');
    currentUrl.searchParams.set('action', 'new-task');
    navigate(currentUrl.pathname + currentUrl.search);
    setCurrentSection('orientacoes');
  };

  const handleExportData = () => {
    // Abrir dialog de exportação/relatórios
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'relatorios');
    navigate(currentUrl.pathname + currentUrl.search);
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

  const handleNavigateToSection = (section: 'dashboard' | 'rotinas' | 'orientacoes' | 'monitoramento') => {
    const currentUrl = new URL(window.location.href);
    const tabName = section === 'dashboard' ? 'overview' : section;
    currentUrl.searchParams.set('tab', tabName);
    navigate(currentUrl.pathname + currentUrl.search);
    setCurrentSection(section);
  };

  const handleBuscaAvancada = () => {
    // Adicionar parâmetro para mostrar busca avançada
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('search', 'advanced');
    navigate(currentUrl.pathname + currentUrl.search);
  };

  const handleFiltrosPorData = () => {
    // Adicionar parâmetro para mostrar filtros por data
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('filters', 'date');
    navigate(currentUrl.pathname + currentUrl.search);
  };

  const handleRelatorios = () => {
    // Navegar para a aba de relatórios
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'relatorios');
    navigate(currentUrl.pathname + currentUrl.search);
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
    onBuscaAvancada: handleBuscaAvancada,
    onFiltrosPorData: handleFiltrosPorData,
    onRelatorios: handleRelatorios,
    onNavigateToSection: handleNavigateToSection
  };
}
