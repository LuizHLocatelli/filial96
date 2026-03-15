
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

export default function Moveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "fretes";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "fretes",
      label: "Fretes",
      icon: Truck,
      description: "Consulta de valores de frete",
      component: <Fretes />
    },
    {
      value: "orcamentos",
      label: "Orçamentos",
      icon: Calculator,
      description: "Gerador de orçamentos em PDF",
      component: <Orcamentos />
    },
    {
      value: "procedimentos-ssc",
      label: "Procedimentos SSC",
      mobileLabel: "SSC",
      icon: Wrench,
      description: "Guia de assistência técnica",
      component: <ProcedimentosSSC />
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
