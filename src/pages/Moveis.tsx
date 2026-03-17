import { useSearchParams } from "react-router-dom";
import { Fretes } from "@/components/moveis/fretes/Fretes";
import { ProcedimentosSSC } from "@/components/moveis/procedimentos-ssc/ProcedimentosSSC";
import { Orcamentos } from "@/components/moveis/orcamentos/Orcamentos";
import {
  Sofa,
  Truck,
  Wrench,
  Calculator
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function Moveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasAccessToTool, isLoading } = useRolePermissions();
  
  // Only set initial active tab once permissions are loaded
  const activeTab = searchParams.get("tab") || (hasAccessToTool("moveis_fretes") ? "fretes" : "orcamentos");

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const allTabsConfig = [
    {
      value: "fretes",
      label: "Fretes",
      icon: "🚛",
      description: "Consulta de valores de frete",
      component: <Fretes />,
      permissionKey: "moveis_fretes"
    },
    {
      value: "orcamentos",
      label: "Orçamentos",
      icon: "📑",
      description: "Gerador de orçamentos em PDF",
      component: <Orcamentos />,
      permissionKey: "moveis_orcamentos"
    },
    {
      value: "procedimentos-ssc",
      label: "Procedimentos SSC",
      mobileLabel: "SSC",
      icon: "🛠️",
      description: "Guia de assistência técnica",
      component: <ProcedimentosSSC />,
      permissionKey: "moveis_ssc"
    }
  ];

  const tabsConfig = allTabsConfig.filter(tab => !tab.permissionKey || hasAccessToTool(tab.permissionKey));

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Móveis"
        description="Gestão completa do setor de móveis"
        icon="🛋️"
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
