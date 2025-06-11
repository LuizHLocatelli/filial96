import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Activity,
  CheckSquare, 
  FileText, 
  BarChart3,
  Users,
  TrendingUp
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

// Importando os componentes corretos das seções
import { HubDashboard } from "@/components/moveis/hub-produtividade/components/dashboard/HubDashboard";
import { CentralAtividades } from "@/components/moveis/hub-produtividade/components/unificacao/CentralAtividades";
import OrientacoesMonitoramento from "@/components/moveis/hub-produtividade/components/OrientacoesMonitoramento";

// Hooks
import { useHubData } from "@/components/moveis/hub-produtividade/hooks/useHubData";
import { useHubHandlers } from "@/components/moveis/hub-produtividade/hooks/useHubHandlers";

// Componentes de funcionalidades
import { BuscaAvancada } from "@/components/moveis/hub-produtividade/components/funcionalidades/BuscaAvancada";
import { FiltrosPorData } from "@/components/moveis/hub-produtividade/components/funcionalidades/FiltrosPorData";
import { Relatorios } from "@/components/moveis/hub-produtividade/components/funcionalidades/Relatorios";



export default function HubProdutividade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();
  
  // Estados para dialogs funcionais
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false);
  const [showFiltrosPorData, setShowFiltrosPorData] = useState(false);
  const [showRelatorios, setShowRelatorios] = useState(false);
  
  const handleTabClick = (value: string) => {
    if (value === 'painel-metas') {
      navigate('/painel-metas');
    } else {
      setSearchParams({ tab: value });
    }
  };

  // Hook para dados
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
    setCurrentSection: () => {}, // Não usado mais
    setSearchTerm: () => {},
    setFilterSearchTerm: () => {},
    setShowMobileSearch: () => {},
    setShowFilters: () => {},
    refreshData
  });

  // Verificar parâmetros de URL para abrir dialogs
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const filtersParam = searchParams.get('filters');
    
    if (searchParam === 'advanced') {
      setShowBuscaAvancada(true);
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams);
    }
    
    if (filtersParam === 'date') {
      setShowFiltrosPorData(true);
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('filters');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  // Handlers para os dialogs
  const handleBuscaAvancadaResults = (results: any) => {
    console.log('Resultados da busca avançada:', results);
    // Aqui você pode implementar a lógica para exibir os resultados
  };

  const handleFiltrosPorDataApply = (filters: any) => {
    console.log('Filtros por data aplicados:', filters);
    // Aqui você pode implementar a lógica para aplicar os filtros
  };

  const tabsConfig = [
    {
      value: "overview",
      label: "Visão Geral",
      icon: Activity,
      description: "Dashboard e métricas",
    },
    {
      value: "atividades",
      label: "Atividades",
      icon: CheckSquare,
      description: "Rotinas, Tarefas e Informativos",
    },
    {
      value: "monitoramento",
      label: "Monitoramento",
      icon: Users,
      description: "Acompanhamento por cargo",
    },
    {
      value: "relatorios",
      label: "Relatórios",
      icon: BarChart3,
      description: "Relatórios e análises",
    },
    {
      value: "painel-metas",
      label: "Painel de Metas",
      icon: TrendingUp,
      description: "Acompanhe as metas da filial",
    }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="glass-card rounded-lg overflow-hidden">
            <HubDashboard
              stats={stats}
              activities={activities}
              isLoading={isLoading}
              handlers={{
                ...handlers,
                onBuscaAvancada: () => setShowBuscaAvancada(true),
                onFiltrosPorData: () => setShowFiltrosPorData(true),
                onRelatorios: () => setShowRelatorios(true)
              }}
              rotinas={rotinas || []}
              tarefas={tarefas || []}
              onViewRotina={(rotinaId) => {
                setSearchParams({ tab: "atividades" });
                // Aqui poderia implementar scroll para a rotina específica
              }}
              onViewTarefa={(tarefaId) => {
                setSearchParams({ tab: "atividades" });
                // Aqui poderia implementar scroll para a tarefa específica
              }}
            />
          </div>
        );
      case 'atividades':
        return (
          <div className="glass-card rounded-lg overflow-hidden">
            <CentralAtividades />
          </div>
        );
      case 'monitoramento':
        return (
          <div className="glass-card rounded-lg overflow-hidden">
            <OrientacoesMonitoramento />
          </div>
        );
      case 'relatorios':
        return (
          <div className="glass-card rounded-lg overflow-hidden p-6">
            <div className="text-center space-y-4">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Relatórios</h3>
                <p className="text-muted-foreground">Visualize relatórios e análises de produtividade</p>
                <div className="mt-4">
                  <button 
                    onClick={() => setShowRelatorios(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Abrir Relatórios Completos
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout spacing="tight" maxWidth="full">
      <PageHeader
        title="Hub de Produtividade"
        description="Central de rotinas, tarefas e orientações"
        icon={Activity}
        iconColor="text-primary"
        variant="default"
      />

      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabClick}
        variant="cards"
        maxColumns={5}
      />

      <div className="mt-6">
        {renderContent()}
      </div>

      {/* Dialogs funcionais */}
      <BuscaAvancada
        open={showBuscaAvancada}
        onOpenChange={setShowBuscaAvancada}
        rotinas={rotinas || []}
        orientacoes={orientacoes || []}
        tarefas={tarefas || []}
        onResultsSelect={handleBuscaAvancadaResults}
      />

      <FiltrosPorData
        open={showFiltrosPorData}
        onOpenChange={setShowFiltrosPorData}
        rotinas={rotinas || []}
        orientacoes={orientacoes || []}
        tarefas={tarefas || []}
        onFiltersApply={handleFiltrosPorDataApply}
      />

      <Relatorios
        open={showRelatorios}
        onOpenChange={setShowRelatorios}
        rotinas={rotinas || []}
        orientacoes={orientacoes || []}
        tarefas={tarefas || []}
        stats={stats}
      />
    </PageLayout>
  );
}