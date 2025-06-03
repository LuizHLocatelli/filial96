import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Activity,
  CheckSquare, 
  FileText, 
  BarChart3,
  Users
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

// Importando os componentes corretos das seções
import { HubDashboard } from "@/components/moveis/hub-produtividade/components/dashboard/HubDashboard";
import { Rotinas } from "@/components/moveis/rotinas/Rotinas";
import { VmTarefas } from "@/components/moveis/orientacoes/Orientacoes";
import OrientacoesMonitoramento from "@/components/moveis/hub-produtividade/components/OrientacoesMonitoramento";

// Hooks
import { useHubData } from "@/components/moveis/hub-produtividade/hooks/useHubData";
import { useHubHandlers } from "@/components/moveis/hub-produtividade/hooks/useHubHandlers";

export default function HubProdutividade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
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

  const tabsConfig = [
    {
      value: "overview",
      label: "Visão Geral",
      icon: Activity,
      description: "Dashboard e métricas",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <HubDashboard
            stats={stats}
            activities={activities}
            isLoading={isLoading}
            handlers={handlers}
          />
        </div>
      )
    },
    {
      value: "rotinas",
      label: "Rotinas",
      icon: CheckSquare,
      description: "Rotinas obrigatórias",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <Rotinas />
        </div>
      )
    },
    {
      value: "orientacoes",
      label: "Informativos e VM",
      icon: FileText,
      description: "Orientações e documentos",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <VmTarefas />
        </div>
      )
    },
    {
      value: "monitoramento",
      label: "Monitoramento",
      icon: Users,
      description: "Acompanhamento por cargo",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <OrientacoesMonitoramento />
        </div>
      )
    },
    {
      value: "relatorios",
      label: "Relatórios",
      icon: BarChart3,
      description: "Relatórios e análises",
      component: (
        <div className="border border-border/40 rounded-lg overflow-hidden p-6">
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Relatórios</h3>
              <p className="text-muted-foreground">Visualize relatórios e análises de produtividade</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Hub de Produtividade"
        description="Central de rotinas, tarefas e orientações"
        icon={Activity}
        iconColor="text-primary"
        status={{
          label: "Ativo",
          color: "bg-green-50 text-green-700 border-green-200"
        }}
        variant="default"
      />

      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="cards"
        maxColumns={4}
      />
    </PageLayout>
  );
} 