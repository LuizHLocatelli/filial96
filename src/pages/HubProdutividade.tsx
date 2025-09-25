
import { useState } from "react";
import { Activity } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

// Hooks
import { useHubData } from "@/components/moveis/hub-produtividade/hooks/useHubData";
import { useHubHandlers } from "@/components/moveis/hub-produtividade/hooks/useHubHandlers";

// Refactored components
import { createTabsConfig } from "./hub-produtividade/tabsConfig";
import { HubDialogs } from "./hub-produtividade/HubDialogs";
import { useHubUrlParams } from "./hub-produtividade/useHubUrlParams";

export default function HubProdutividade() {
  // Estados para dialogs funcionais
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);
  
  // Hook para dados
  const {
    stats,
    orientacoes,
    isLoading,
    refreshData
  } = useHubData();

  // Hook para handlers
  const handlers = useHubHandlers({
    setCurrentSection: () => {}, // Não usado mais
    setSearchTerm: () => {},
    setFilterSearchTerm: () => {},
    setShowMobileSearch: () => {},
    setShowFilters: () => {},
    refreshData
  });

  // Hook para parâmetros de URL
  const { searchParams, setSearchParams } = useHubUrlParams({
    setShowBuscaAvancada,
    setShowFiltrosPorData
  });

  const activeTab = searchParams.get("tab") || "assistentes"; // Changed to "assistentes" as default
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Handlers para os dialogs
  const handleBuscaAvancadaResults = (results: any) => {
    console.log('Resultados da busca avançada:', results);
    // Aqui você pode implementar a lógica para exibir os resultados
  };

  const handleFiltrosPorDataApply = (filters: any) => {
    console.log('Filtros por data aplicados:', filters);
    // Aqui você pode implementar a lógica para aplicar os filtros
  };

  // Handlers com dialogs integrados
  const handlersWithDialogs = {
    ...handlers,
    onBuscaAvancada: () => setShowBuscaAvancada(true),
    onFiltrosPorData: () => setShowFiltrosPorData(true)
  };

  const tabsConfig = createTabsConfig({
    stats,
    isLoading,
    handlers: handlersWithDialogs,
    orientacoes: orientacoes || [],
    onViewRotina: (rotinaId) => {
      // Função removida - atividades foram removidas do sistema
    },
    onViewTarefa: (tarefaId) => {
      // Função removida - atividades foram removidas do sistema
    },
    
  });

  return (
    <PageLayout spacing="tight" maxWidth="full">
      <PageHeader
        title="Hub de Produtividade"
        description="Central de assistentes de IA e ferramentas"
        icon={Activity}
        iconColor="text-primary"
        variant="default"
      />

      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="cards"
        maxColumns={3} // Changed from 5 to 3 since we have fewer tabs
      />

      <HubDialogs
        showBuscaAvancada={showBuscaAvancada}
        setShowBuscaAvancada={setShowBuscaAvancada}
        showFiltrosPorData={showFiltrosPorData}
        setShowFiltrosPorData={setShowFiltrosPorData}
        orientacoes={orientacoes || []}
        onBuscaAvancadaResults={handleBuscaAvancadaResults}
        onFiltrosPorDataApply={handleFiltrosPorDataApply}
      />
    </PageLayout>
  );
}
