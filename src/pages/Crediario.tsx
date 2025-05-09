
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";

const Crediario = () => {
  const [activeTab, setActiveTab] = useState("listagens");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Crediário</h2>
        <p className="text-muted-foreground">
          Gerenciamento de cobranças, clientes agendados, depósitos e folgas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="listagens">Listagens</TabsTrigger>
          <TabsTrigger value="clientes">Clientes Agendados</TabsTrigger>
          <TabsTrigger value="depositos">Depósitos</TabsTrigger>
          <TabsTrigger value="folgas">Folgas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listagens" className="mt-6">
          <Listagens />
        </TabsContent>
        
        <TabsContent value="clientes" className="mt-6">
          <ClientesAgendados />
        </TabsContent>
        
        <TabsContent value="depositos" className="mt-6">
          <Depositos />
        </TabsContent>
        
        <TabsContent value="folgas" className="mt-6">
          <Folgas />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Crediario;
