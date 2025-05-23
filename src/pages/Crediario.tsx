
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

  const currentTab = tabsConfig.find(tab => tab.value === activeTab) || tabsConfig[0];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-3 sm:space-y-4 w-full">
        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">Crediário</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm truncate">
                    Sistema completo de gestão do crediário
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs flex-shrink-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </div>

            {/* Navigation Cards */}
            <div className="w-full overflow-x-auto">
              <div className="flex gap-2 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:min-w-0 sm:gap-2">
                {tabsConfig.map((tab) => (
                  <Card 
                    key={tab.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0 w-24 sm:w-auto ${
                      activeTab === tab.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleTabChange(tab.value)}
                  >
                    <CardContent className="p-2 sm:p-2.5">
                      <div className="flex flex-col items-center gap-1 sm:gap-1.5 text-center">
                        <div className={`p-1.5 rounded-lg ${
                          activeTab === tab.value 
                            ? 'bg-blue-500 text-white' 
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
