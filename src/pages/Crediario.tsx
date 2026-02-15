import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { Diretorio } from "@/components/crediario/diretorio/Diretorio";
import { CalculadoraCredito } from "@/components/crediario/CalculadoraCredito";
import { 
  Calendar, 
  Coffee, 
  FolderArchive,
  CreditCard,
  Calculator
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Crediario() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "depositos";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "depositos",
      label: "Depósitos",
      icon: Calendar,
      description: "Controle de depósitos",
      component: <Depositos />
    },
    {
      value: "calculadora",
      label: "Calculadora",
      icon: Calculator,
      description: "Calculadora de renegociação",
      component: <CalculadoraCredito />
    },
    {
      value: "folgas",
      label: "Folgas",
      icon: Coffee,
      description: "Gestão de folgas",
      component: <Folgas />
    },
    {
      value: "diretorio",
      label: "Diretório",
      icon: FolderArchive,
      description: "Arquivos do crediário",
      component: <Diretorio />
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Crediário"
        description="Sistema completo de gestão do crediário"
        icon={CreditCard}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Crediário" }
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
