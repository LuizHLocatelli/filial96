
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Diretorio } from "@/components/moveis/diretorio/Diretorio";
import { VendaO } from "@/components/moveis/vendao/VendaO";
import { Folgas } from "@/components/moveis/folgas/Folgas";
import { ProdutoFoco } from "@/components/moveis/produto-foco/ProdutoFoco";
import { Descontinuados } from "@/components/moveis/descontinuados/Descontinuados";
import { 
  FileText, 
  FolderArchive, 
  ShoppingCart,
  Sofa,
  TrendingUp,
  Calendar,
  Star,
  Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLayout as Layout } from "@/components/layout/AppLayout";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Moveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "diretorio";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleNavigate = (tab: string) => {
    setSearchParams({ tab: tab });
  };

  const tabsConfig = [
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
      value: "descontinuados",
      label: "Descontinuados",
      icon: Package,
      description: "Produtos com desconto especial",
      component: <Descontinuados onBack={() => handleNavigate("diretorio")} />,
      badge: "PROMOÇÃO"
    },
    {
      value: "folgas",
      label: "Folgas",
      icon: Calendar,
      description: "Controle de folgas",
      component: <Folgas />
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Móveis"
        description="Gestão completa do setor de móveis"
        icon={Sofa}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Móveis" }
        ]}
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
