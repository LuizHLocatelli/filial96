
import { useSearchParams } from "react-router-dom";
import { Folgas } from "@/components/moveis/folgas/Folgas";
import { ProdutoFoco } from "@/components/moveis/produto-foco/ProdutoFoco";
import { Descontinuados } from "@/components/moveis/descontinuados/Descontinuados";
import { Fretes } from "@/components/moveis/fretes/Fretes";
import { ProcedimentosSSC } from "@/components/moveis/procedimentos-ssc/ProcedimentosSSC";
import {
  Sofa,
  Calendar,
  Star,
  Package,
  Truck,
  Wrench
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Moveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "produto-foco";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
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
      component: <Descontinuados />,
      badge: "PROMOÇÃO"
    },
    {
      value: "folgas",
      label: "Folgas",
      icon: Calendar,
      description: "Controle de folgas",
      component: <Folgas />
    },
    {
      value: "fretes",
      label: "Fretes",
      icon: Truck,
      description: "Consulta de valores de frete",
      component: <Fretes />
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
        maxColumns={5}
      />
    </PageLayout>
  );
}
