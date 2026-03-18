import { useState, useEffect } from "react";
import { Activity } from "@/components/ui/emoji-icons";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

// Hooks
import { useHubData } from "@/components/hub-produtividade/hooks/useHubData";
import { useHubHandlers } from "@/components/hub-produtividade/hooks/useHubHandlers";

// Refactored components
import { createTabsConfig } from "./hub-produtividade/tabsConfig";
import { HubDialogs } from "./hub-produtividade/HubDialogs";
import { useHubUrlParams } from "./hub-produtividade/useHubUrlParams";
import { WelcomeHubDialog } from "./hub-produtividade/WelcomeHubDialog";

export default function HubProdutividade() {
  // Estados para dialogs funcionais
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  // Efeito para mostrar boas-vindas após login
  useEffect(() => {
    const justLoggedIn = (location.state as any)?.justLoggedIn;
    const welcomeShown = sessionStorage.getItem("welcome_shown");

    if (justLoggedIn && !welcomeShown) {
      setShowWelcome(true);
      sessionStorage.setItem("welcome_shown", "true");
    }
  }, [location]);

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
    handlers: handlersWithDialogs
  });

  return (
    <PageLayout spacing="tight" maxWidth="full">
      <PageHeader
        title="Hub de Produtividade"
        description="Central de ferramentas e produtividade"
        icon="🏠"
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

      <WelcomeHubDialog 
        open={showWelcome} 
        onOpenChange={setShowWelcome} 
      />
    </PageLayout>
  );
}
