
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { Kanban } from "@/components/crediario/kanban/Kanban";
import { useIsMobile } from "@/hooks/use-mobile";

const Crediario = () => {
  const [activeTab, setActiveTab] = useState("listagens");
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Crediário</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerenciamento de cobranças, clientes agendados, depósitos, folgas e quadro de tarefas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center w-full mb-2">
          <TabsList className={`grid grid-cols-5 w-full max-w-3xl gap-1`}>
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
