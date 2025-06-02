import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Diretorio } from "@/components/moveis/diretorio/Diretorio";
import { VendaO } from "@/components/moveis/vendao/VendaO";
import { Folgas } from "@/components/moveis/folgas/Folgas";
import { ProdutoFoco } from "@/components/moveis/produto-foco/ProdutoFoco";
import { HubProdutividade } from "@/components/moveis/hub-produtividade/HubProdutividade";
import { 
  FileText, 
  FolderArchive, 
  ShoppingCart,
  Sofa,
  TrendingUp,
  Calendar,
  Star,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLayout as Layout } from "@/components/layout/AppLayout";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Moveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "hub-produtividade";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "hub-produtividade",
      label: "Hub de Produtividade",
      icon: Activity,
      description: "Rotinas, orientações e tarefas centralizadas",
      component: <HubProdutividade />
    },
    {
      value: "diretorio",
      label: "Diretório",
      icon: FolderArchive,
      description: "Arquivos organizados",
      component: <Diretorio />
    },
    {
      value: "vendao",
      label: "Venda O",
      icon: ShoppingCart,
      description: "Vendas de outras filiais",
      component: <VendaO />
    },
    {
      value: "produto-foco",
      label: "Produto Foco",
      icon: Star,
      description: "Produtos prioritários",
      component: <ProdutoFoco />
    },
    {
      value: "folgas",
      label: "Folgas",
      icon: Calendar,
      description: "Controle de folgas",
      component: <Folgas />
    }
  ];

  // Encontrar a aba ativa e seu componente
  const activeTabConfig = tabsConfig.find(tab => tab.value === activeTab);

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Móveis"
        description="Gestão completa do setor de móveis"
        icon={Sofa}
        iconColor="text-primary"
        status={{
          label: "Ativo",
          color: "bg-green-50 text-green-700 border-green-200"
        }}
        variant="default"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Móveis" }
        ]}
      />

      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="cards"
        maxColumns={3}
      />

      {/* Renderizar o componente da aba ativa */}
      <div className="mt-6">
        {activeTabConfig?.component}
      </div>
    </PageLayout>
  );
}
