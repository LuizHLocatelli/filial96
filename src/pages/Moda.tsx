
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Diretorio } from "@/components/moda/diretorio/Diretorio";
import { Folgas } from "@/components/moda/folgas/Folgas";
import { ProdutoFoco } from "@/components/moda/produto-foco/ProdutoFoco";
import { Reservas } from "@/components/moda/reservas/Reservas";
import { Estoque } from "@/components/moda/Estoque";
import { useModaTracking } from "@/hooks/useModaTracking";
import { 
  FileText, 
  FolderArchive, 
  Shirt,
  TrendingUp,
  Calendar,
  Star,
  Clock,
  Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLayout as Layout } from "@/components/layout/AppLayout";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Moda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "diretorio";
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { trackNavigationEvent, trackTimeSpent } = useModaTracking();
  
  useEffect(() => {
    // Registrar navegação inicial
    trackNavigationEvent("moda", "acesso_inicial");
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    // Registrar tempo gasto na seção anterior e navegação para nova seção
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (timeSpent > 5) { // Só registra se ficou mais de 5 segundos
      trackTimeSpent(activeTab, timeSpent);
    }
    
    // Registrar navegação para nova seção
    trackNavigationEvent(activeTab, "mudanca_secao");
    setStartTime(Date.now());
  }, [activeTab]);

  useEffect(() => {
    // Registrar tempo ao sair da página
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) {
        trackTimeSpent(activeTab, timeSpent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Registrar tempo ao desmontar componente
    };
  }, [activeTab, startTime, trackTimeSpent]);
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
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
      value: "produto-foco",
      label: "Produto Foco",
      icon: Star,
      description: "Produtos prioritários",
      component: <ProdutoFoco />
    },
    {
      value: "reservas",
      label: "Reservas",
      icon: Clock,
      description: "Controle de reservas",
      mobileLabel: "Reservas",
      component: <Reservas />
    },
    {
      value: "folgas",
      label: "Folgas",
      icon: Calendar,
      description: "Controle de folgas",
      component: <Folgas />
    },
    {
      value: "estoque",
      label: "Estoque",
      icon: Package,
      description: "Contagem de estoque",
      component: <Estoque />
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Moda"
        description="Gestão completa do setor de moda"
        icon={Shirt}
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
        maxColumns={5}
      />
    </PageLayout>
  );
}
