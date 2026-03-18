import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubViewMode } from '../types';
import { HubHandlers } from '../types/hubTypes';
import { toast } from "sonner";

interface UseHubHandlersProps {
  setCurrentSection: (section: string) => void;
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

  const handleNovaTarefa = () => {
    console.log("✅ Handler Nova Tarefa executado");
    try {
          // Função removida - atividades foram removidas do sistema
    console.log("✅ Nova tarefa desabilitada - sistema de atividades removido");
      
      toast({
        title: "Funcionalidade Removida",
        description: "O sistema de atividades foi removido",
        variant: "destructive",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Erro no handler Nova Tarefa:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir formulário de nova tarefa",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    console.log("📊 Handler Export Data executado");
    try {
      // Navegar para a tab de relatórios
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('tab', 'relatorios');
      navigate(currentUrl.pathname + currentUrl.search);
      
      toast({
        title: "Relatórios",
        description: "Redirecionando para relatórios...",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Erro no handler Export Data:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir relatórios",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (term: string) => {
    console.log("🔍 Handler Search executado com termo:", term);
    setSearchTerm(term);
    setFilterSearchTerm(term);
  };

  const handleRefreshData = async () => {
    console.log("🔄 Handler Refresh Data executado");
    try {
      await refreshData();
      toast({
        title: "Dados Atualizados",
        description: "Informações foram atualizadas com sucesso!",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Erro no refresh data:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados",
        variant: "destructive",
      });
    }
  };

  const handleShowMobileSearch = () => {
    console.log("📱 Handler Mobile Search executado");
    setShowMobileSearch(true);
  };

  const handleShowFilters = () => {
    console.log("🔍 Handler Show Filters executado");
    setShowFilters(true);
  };

  const handleNavigateToSection = (section: 'cartazes' | 'monitoramento') => {
    console.log("🧭 Handler Navigate to Section executado:", section);
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('tab', section);
      navigate(currentUrl.pathname + currentUrl.search);
      setCurrentSection(section);
      
      toast({
        title: "Navegação",
        description: `Redirecionando para ${section}...`,
        duration: 1500,
      });
    } catch (error) {
      console.error("❌ Erro na navegação:", error);
    }
  };

  const handleBuscaAvancada = () => {
    console.log("🔍 Handler Busca Avançada executado");
    try {
      // Adicionar parâmetro para mostrar busca avançada
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('search', 'advanced');
      navigate(currentUrl.pathname + currentUrl.search);
      
      toast({
        title: "Busca Avançada",
        description: "Abrindo busca avançada...",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Erro na busca avançada:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir busca avançada",
        variant: "destructive",
      });
    }
  };

  const handleFiltrosPorData = () => {
    console.log("📅 Handler Filtros por Data executado");
    try {
      // Adicionar parâmetro para mostrar filtros por data
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('filters', 'date');
      navigate(currentUrl.pathname + currentUrl.search);
      
      toast({
        title: "Filtros por Data",
        description: "Abrindo filtros por data...",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Erro nos filtros por data:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir filtros por data",
        variant: "destructive",
      });
    }
  };

  const handleRelatorios = () => {
    console.log("📊 Handler Relatórios executado");
    try {
      // Navegar para a aba de relatórios
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('tab', 'relatorios');
      navigate(currentUrl.pathname + currentUrl.search);
      
      toast({
        title: "Relatórios",
        description: "Redirecionando para relatórios...",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Erro nos relatórios:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir relatórios",
        variant: "destructive",
      });
    }
  };

  return {
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
