
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Reservas } from "@/components/moda/reservas/Reservas";
import { Estoque } from "@/components/moda/Estoque";
import { 
  FileText, 
  Shirt,
  TrendingUp,
  Clock,
  Package
} from "@/components/ui/emoji-icons";
import { Badge } from "@/components/ui/badge";
import { AppLayout as Layout } from "@/components/layout/AppLayout";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Moda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "reservas";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "reservas",
      label: "Reservas",
      icon: "⏳",
      description: "Controle de reservas",
      mobileLabel: "Reservas",
      component: <Reservas />
    },
    {
      value: "estoque",
      label: "Estoque",
      icon: "📦",
      description: "Contagem de estoque",
      component: <Estoque />
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Moda"
        description="Gestão completa do setor de moda"
        icon="👕"
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Moda" }
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
