
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Orientacoes } from "@/components/moveis/orientacoes/Orientacoes";
import { Diretorio } from "@/components/moveis/diretorio/Diretorio";
import { VendaO } from "@/components/moveis/vendao/VendaO";
import { Folgas } from "@/components/moveis/folgas/Folgas";
import { ProdutoFoco } from "@/components/moveis/produto-foco/ProdutoFoco";
import { 
  FileText, 
  FolderArchive, 
  ShoppingCart,
  Sofa,
  TrendingUp,
  Calendar,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Moveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "orientacoes";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "orientacoes",
      label: "Orientações",
      icon: FileText,
      description: "Documentos e orientações",
      component: <Orientacoes />
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

  const currentTab = tabsConfig.find(tab => tab.value === activeTab) || tabsConfig[0];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full px-2 sm:px-4">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <Sofa className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Móveis</h1>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                  Gestão completa do setor de móveis
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {tabsConfig.map((tab) => (
            <Card 
              key={tab.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                activeTab === tab.value 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => handleTabChange(tab.value)}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col items-center gap-1 sm:gap-3 text-center">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    activeTab === tab.value 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <h3 className="font-medium text-xs sm:text-sm truncate">{tab.label}</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block truncate">
                      {tab.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Tab Content */}
      <div className="space-y-4">
        {currentTab.component}
      </div>
    </div>
  );
}
