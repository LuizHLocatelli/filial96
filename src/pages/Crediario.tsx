
import { useState, useEffect } from "react";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { Kanban } from "@/components/crediario/kanban/Kanban";
import { Diretorio } from "@/components/crediario/diretorio/Diretorio";
import { useSearchParams, useNavigate } from "react-router-dom";
import { QuickAccess } from "@/components/crediario/QuickAccess";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, Users, Banknote, Coffee, KanbanSquare, FolderArchive, CircleAlert } from "lucide-react";
import { CrediarioOverview } from "@/components/crediario/dashboard/CrediarioOverview";

const Crediario = () => {
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
    if (tabFromUrl && ["welcome", "listagens", "clientes", "depositos", "folgas", "kanban", "diretorio"].includes(tabFromUrl)) {
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
            <CrediarioOverview onNavigate={handleTabChange} />
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
                      <li>Verificar depósitos pendentes desta semana</li>
                      <li>Atualizar listagens de clientes com pagamentos em atraso</li>
                      <li>Revisar contratos com negociação pendente</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Clientes agendados hoje</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                  Existem 3 clientes agendados para contato hoje. Acesse a seção de clientes para mais detalhes.
                </AlertDescription>
              </Alert>
            </div>
            
            <QuickAccess onNavigate={handleTabChange} />
          </div>
        );
      case "listagens":
        return <Listagens />;
      case "clientes":
        return <ClientesAgendados />;
      case "depositos":
        return <Depositos />;
      case "folgas":
        return <Folgas />;
      case "kanban":
        return <Kanban />;
      case "diretorio":
        return <Diretorio />;
      default:
        return <QuickAccess onNavigate={handleTabChange} />;
    }
  };

  const showCompactMenu = activeTab !== "welcome";

  return (
    <div className="space-y-4"> 
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {activeTab === "welcome" ? "Crediário" : 
           activeTab === "listagens" ? "Listagens do Crediário" :
           activeTab === "clientes" ? "Clientes Agendados" :
           activeTab === "depositos" ? "Depósitos" :
           activeTab === "folgas" ? "Folgas" :
           activeTab === "kanban" ? "Quadro de Tarefas" :
           activeTab === "diretorio" ? "Diretório de Arquivos" : "Crediário"}
        </h1>
        <p className="text-muted-foreground">
          {activeTab === "welcome" ? "Gerencie todas as operações do crediário em um só lugar" : 
           activeTab === "listagens" ? "Visualize e gerencie as listagens de crediário" :
           activeTab === "clientes" ? "Acompanhe os clientes agendados para contato e pagamento" :
           activeTab === "depositos" ? "Controle os depósitos diários realizados" :
           activeTab === "folgas" ? "Gerencie as folgas da equipe do crediário" :
           activeTab === "kanban" ? "Organize as tarefas do setor usando o quadro kanban" :
           activeTab === "diretorio" ? "Acesse todos os documentos importantes do setor" : ""}
        </p>
      </div>
      
      {showCompactMenu && (
        <div className="mb-3 bg-muted/50 rounded-lg p-3"> 
          <QuickAccess onNavigate={handleTabChange} compact={true} />
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default Crediario;
