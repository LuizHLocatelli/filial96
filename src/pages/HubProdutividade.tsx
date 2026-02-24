import { useState } from "react";
import { Activity } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

// Hooks
import { useHubData } from "@/components/moveis/hub-produtividade/hooks/useHubData";
import { useHubHandlers } from "@/components/moveis/hub-produtividade/hooks/useHubHandlers";
import { useAuth } from "@/contexts/auth";

// Refactored components
import { createTabsConfig } from "./hub-produtividade/tabsConfig";
import { HubDialogs } from "./hub-produtividade/HubDialogs";
import { useHubUrlParams } from "./hub-produtividade/useHubUrlParams";

export default function HubProdutividade() {
  // Estados para dialogs funcionais
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);

  // Hook para autenticação e perfil
  const { profile } = useAuth();
  const isManager = profile?.role === 'gerente';

  // Hook para dados
  const {
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

  const activeTab = searchParams.get("tab") || "escalas";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Handlers para os dialogs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBuscaAvancadaResults = (results: any) => {
    console.log('Resultados da busca avançada:', results);
    // Aqui você pode implementar a lógica para exibir os resultados
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    isLoading,
    handlers: handlersWithDialogs,
    isManager
  });

  return (
    <PageLayout spacing="tight" maxWidth="full">
      <PageHeader
        title="Hub de Produtividade"
        description="Central de ferramentas e produtividade"
        icon={Activity}
        iconColor="text-primary"
        variant="default"
      />

      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="cards"
        maxColumns={4} // Changed to 4 to accommodate new Escalas tab
      />

      <HubDialogs
        showBuscaAvancada={showBuscaAvancada}
        setShowBuscaAvancada={setShowBuscaAvancada}
        showFiltrosPorData={showFiltrosPorData}
        setShowFiltrosPorData={setShowFiltrosPorData}
        onBuscaAvancadaResults={handleBuscaAvancadaResults}
        onFiltrosPorDataApply={handleFiltrosPorDataApply}
      />
    </PageLayout>
  );
}
