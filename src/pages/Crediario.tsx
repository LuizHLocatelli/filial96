import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { Diretorio } from "@/components/crediario/diretorio/Diretorio";
import { 
  FileText, 
  Users, 
  Calendar, 
  Coffee, 
  FolderArchive,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Crediario() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "listagens";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "listagens",
      label: "Listagens",
      icon: FileText,
      description: "Relatórios e listagens",
      component: <Listagens />
    },
    {
      value: "clientes",
      label: "Clientes",
      icon: Users,
      description: "Gestão de clientes",
      component: <ClientesAgendados />
    },
    {
      value: "depositos",
      label: "Depósitos",
      icon: Calendar,
      description: "Controle de depósitos",
      component: <Depositos />
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
        maxColumns={3}
      />
    </PageLayout>
  );
}
