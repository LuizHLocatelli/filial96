
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Crediário</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Sistema completo de gestão do crediário
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.value 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-muted'
                  }`}>
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-xs sm:text-sm">{tab.label}</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {tab.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex">
            {tabsConfig.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0"
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabsConfig.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
