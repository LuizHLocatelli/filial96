
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
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Crediário</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerenciamento de cobranças, clientes agendados, depósitos e folgas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid ${isMobile ? "grid-cols-2 gap-1 mb-2" : "grid-cols-4"} w-full sm:w-auto md:w-[600px]`}>
          <TabsTrigger value="listagens" className="text-sm sm:text-base">Listagens</TabsTrigger>
          <TabsTrigger value="clientes" className="text-sm sm:text-base">Clientes</TabsTrigger>
          {isMobile && (
            <>
              <TabsTrigger value="depositos" className="text-sm sm:text-base">Depósitos</TabsTrigger>
              <TabsTrigger value="folgas" className="text-sm sm:text-base">Folgas</TabsTrigger>
            </>
          )}
          {!isMobile && (
            <>
              <TabsTrigger value="depositos" className="text-sm sm:text-base">Depósitos</TabsTrigger>
              <TabsTrigger value="folgas" className="text-sm sm:text-base">Folgas</TabsTrigger>
            </>
          )}
        </TabsList>
        
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
