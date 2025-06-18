import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  // Ícones necessários
  FileText, 
  Users, 
  Calendar 
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

// Componentes específicos da página
// import { ComponenteA } from "./components/ComponenteA";
// import { ComponenteB } from "./components/ComponenteB";

/**
 * Template Padrão de Página - Filial 96
 * 
 * Este template deve ser usado como base para todas as páginas do sistema
 * Segue o sistema de design padronizado
 */
export default function NomeDaPagina() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "primeira-tab";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Configuração das tabs - seguir este padrão
  const tabsConfig = [
    {
      value: "primeira-tab",
      label: "Primeira Tab",
      icon: FileText,
      description: "Descrição da primeira tab",
      component: <PrimeiroComponente />
    },
    {
      value: "segunda-tab", 
      label: "Segunda Tab",
      icon: Users,
      description: "Descrição da segunda tab",
      component: <SegundoComponente />
    },
    {
      value: "terceira-tab",
      label: "Terceira Tab",
      icon: Calendar,
      description: "Descrição da terceira tab",
      component: <TerceiroComponente />
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      {/* Header padronizado */}
      <PageHeader
        title="Nome da Página"
        description="Descrição clara do que esta página faz"
        icon={FileText} // Ícone representativo
        iconColor="text-primary" // Sempre verde
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Nome da Página" }
        ]}
      />

      {/* Navegação padronizada */}
      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="cards" // ou "tabs" dependendo do contexto
        maxColumns={4} // Ajustar conforme necessário
      />
    </PageLayout>
  );
}

// Componentes de exemplo - manter arquivos separados na prática
function PrimeiroComponente() {
  return (
    <div className="space-y-4">
      {/* Conteúdo do primeiro componente */}
    </div>
  );
}

function SegundoComponente() {
  return (
    <div className="space-y-4">
      {/* Conteúdo do segundo componente */}
    </div>
  );
}

function TerceiroComponente() {
  return (
    <div className="space-y-4">
      {/* Conteúdo do terceiro componente */}
    </div>
  );
} 