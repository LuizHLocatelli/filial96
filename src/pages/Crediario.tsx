
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { useIsMobile } from "@/hooks/use-mobile";

const Crediario = () => {
  const [activeTab, setActiveTab] = useState("listagens");
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Crediário</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerenciamento de cobranças, clientes agendados, depósitos e folgas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center w-full mb-2">
          <TabsList className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-4"} w-full max-w-md`}>
            <TabsTrigger 
              value="listagens" 
              className={`text-sm sm:text-base py-2 ${isMobile ? "px-1" : "px-4"}`}
            >
              Listagens
            </TabsTrigger>
            <TabsTrigger 
              value="clientes" 
              className={`text-sm sm:text-base py-2 ${isMobile ? "px-1" : "px-4"}`}
            >
              Clientes
            </TabsTrigger>
            {isMobile && (
              <>
                <TabsTrigger 
                  value="depositos" 
                  className="text-sm sm:text-base py-2 px-1"
                >
                  Depósitos
                </TabsTrigger>
                <TabsTrigger 
                  value="folgas" 
                  className="text-sm sm:text-base py-2 px-1"
                >
                  Folgas
                </TabsTrigger>
              </>
            )}
            {!isMobile && (
              <>
                <TabsTrigger 
                  value="depositos" 
                  className="text-sm sm:text-base py-2 px-4"
                >
                  Depósitos
                </TabsTrigger>
                <TabsTrigger 
                  value="folgas" 
                  className="text-sm sm:text-base py-2 px-4"
                >
                  Folgas
                </TabsTrigger>
              </>
            )}
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
      </Tabs>
    </div>
  );
};

export default Crediario;
