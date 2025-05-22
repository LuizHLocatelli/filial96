
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, InfoIcon, CircleAlert } from "lucide-react";
import { QuickAccess } from "@/components/moveis/QuickAccess";
import { Orientacoes } from "@/components/moveis/orientacoes/Orientacoes";
import { Diretorio } from "@/components/moveis/diretorio/Diretorio";
import { VendaO } from "@/components/moveis/vendao/VendaO";
import { MoveisOverview } from "@/components/moveis/dashboard/MoveisOverview";

const Moveis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "welcome");
  const navigate = useNavigate();

  // Update URL when the tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);

  // Update the tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ["welcome", "orientacoes", "diretorio", "vendao"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "welcome":
        return (
          <div className="space-y-6">
            <MoveisOverview onNavigate={handleTabChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CircleAlert className="h-5 w-5 text-yellow-500" />
                    <span>Lembretes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Verificar orientações de VM pendentes</li>
                      <li>Acompanhar novas remessas de móveis</li>
                      <li>Revisar tarefas de organização do setor</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Novas orientações</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                  Existem novas orientações de VM disponíveis. Acesse a seção de orientações para mais detalhes.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );
      case "orientacoes":
        return <Orientacoes />;
      case "diretorio":
        return <Diretorio />;
      case "vendao":
        return <VendaO />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4"> 
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {activeTab === "welcome" ? "Móveis" : 
           activeTab === "orientacoes" ? "Orientações e Informativos" :
           activeTab === "diretorio" ? "Diretório de Arquivos" :
           activeTab === "vendao" ? "Venda O" : "Móveis"}
        </h1>
        <p className="text-muted-foreground">
          {activeTab === "welcome" ? "Gerencie todas as operações do setor de móveis" : 
           activeTab === "orientacoes" ? "Orientações de VM e informativos do setor" :
           activeTab === "diretorio" ? "Acesse documentos do setor de móveis" :
           activeTab === "vendao" ? "Gerencie vendas de outras filiais" : ""}
        </p>
      </div>
      
      <QuickAccess onNavigate={handleTabChange} compact={true} />
      
      {renderContent()}
    </div>
  );
}

export default Moveis;
