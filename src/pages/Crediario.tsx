
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { Kanban } from "@/components/crediario/kanban/Kanban";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams, useNavigate } from "react-router-dom";
import { QuickAccess } from "@/components/crediario/QuickAccess";

const Crediario = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "welcome");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Atualizar URL quando a aba mudar
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);

  // Atualizar a aba quando a URL mudar
  useEffect(() => {
    if (tabFromUrl && ["welcome", "listagens", "clientes", "depositos", "folgas", "kanban"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Crediário</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerenciamento de cobranças, clientes agendados, depósitos, folgas e quadro de tarefas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center w-full mb-2">
          <TabsList className={`grid grid-cols-6 w-full max-w-3xl gap-1`}>
            <TabsTrigger 
              value="welcome" 
              className={`text-xs sm:text-base py-2 px-1 sm:px-4`}
            >
              Início
            </TabsTrigger>
            <TabsTrigger 
              value="listagens" 
              className={`text-xs sm:text-base py-2 px-1 sm:px-4`}
            >
              Listagens
            </TabsTrigger>
            <TabsTrigger 
              value="clientes" 
              className={`text-xs sm:text-base py-2 px-1 sm:px-4`}
            >
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="depositos" 
              className={`text-xs sm:text-base py-2 px-1 sm:px-4`}
            >
              Depósitos
            </TabsTrigger>
            <TabsTrigger 
              value="folgas" 
              className={`text-xs sm:text-base py-2 px-1 sm:px-4`}
            >
              Folgas
            </TabsTrigger>
            <TabsTrigger 
              value="kanban" 
              className={`text-xs sm:text-base py-2 px-1 sm:px-4`}
            >
              Quadro
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="welcome" className="mt-4 sm:mt-6">
          <QuickAccess onNavigate={handleTabChange} />
        </TabsContent>
        
        <TabsContent value="listagens" className="mt-4 sm:mt-6">
          <Listagens />
        </TabsContent>
        
        <TabsContent value="clientes" className="mt-4 sm:mt-6">
          <ClientesAgendados />
        </TabsContent>
        
        <TabsContent value="depositos" className="mt-4 sm:mt-6">
          <Depositos />
        </TabsContent>
        
        <TabsContent value="folgas" className="mt-4 sm:mt-6">
          <Folgas />
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-4 sm:mt-6">
          <Kanban />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Crediario;
