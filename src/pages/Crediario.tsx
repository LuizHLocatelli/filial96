
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
    <div className="space-y-4 sm:space-y-6 max-w-full px-2 sm:px-4">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Crediário</h1>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                  Sistema completo de gestão do crediário
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
        </div>

        {/* Navigation Cards - 3 por linha */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 max-w-4xl mx-auto">
          {tabsConfig.map((tab) => (
            <Card 
              key={tab.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                activeTab === tab.value 
                  ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => handleTabChange(tab.value)}
            >
              <CardContent className="p-2 sm:p-3 lg:p-4">
                <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    activeTab === tab.value 
                      ? 'bg-blue-500 text-white' 
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
