
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrientacoesList } from "./OrientacoesList";
import { OrientacaoUploader } from "./OrientacaoUploader";
import { OrientacaoTarefas } from "./OrientacaoTarefas";

export function Orientacoes() {
  const [activeTab, setActiveTab] = useState("lista");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative">
          <TabsList className="w-full grid grid-cols-3 gap-1 mb-4">
            <TabsTrigger value="lista" className="px-2">Orientações</TabsTrigger>
            <TabsTrigger value="upload" className="px-2">Nova Orientação</TabsTrigger>
            <TabsTrigger value="tarefas" className="px-2">Tarefas de VM</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lista" className="pt-2 sm:pt-4">
          <OrientacoesList refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="upload" className="pt-2 sm:pt-4">
          <OrientacaoUploader onSuccess={() => {
            handleRefresh();
            setActiveTab("lista");
          }} />
        </TabsContent>

        <TabsContent value="tarefas" className="pt-2 sm:pt-4">
          <OrientacaoTarefas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
