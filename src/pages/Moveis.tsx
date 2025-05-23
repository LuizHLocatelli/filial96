
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Orientacoes } from "@/components/moveis/orientacoes/Orientacoes";
import { Diretorio } from "@/components/moveis/diretorio/Diretorio";
import { VendaO } from "@/components/moveis/vendao/VendaO";
import { 
  FileText, 
  FolderArchive, 
  ShoppingCart,
  Sofa,
  TrendingUp
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
    }
  ];

  const currentTab = tabsConfig.find(tab => tab.value === activeTab) || tabsConfig[0];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-3 sm:space-y-4 w-full">
        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                  <Sofa className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">Móveis</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm truncate">
                    Gestão completa do setor de móveis
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="w-full overflow-x-auto">
              <div className="flex gap-2 min-w-max sm:grid sm:grid-cols-3 sm:min-w-0 sm:gap-3">
                {tabsConfig.map((tab) => (
                  <Card 
                    key={tab.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0 w-28 sm:w-auto ${
                      activeTab === tab.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleTabChange(tab.value)}
                  >
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
                        <div className={`p-1.5 rounded-lg ${
                          activeTab === tab.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-medium text-xs sm:text-sm leading-tight">{tab.label}</h3>
                          <p className="text-xs text-muted-foreground hidden sm:block leading-tight">
                            {tab.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Tab Content */}
        <div className="w-full max-w-full overflow-hidden">
          {currentTab.component}
        </div>
      </div>
    </div>
  );
}
