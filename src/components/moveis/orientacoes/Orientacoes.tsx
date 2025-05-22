
import { useState } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrientacoesList } from "./OrientacoesList";
import { OrientacaoTarefas } from "./OrientacaoTarefas";
import { OrientacaoUploader } from "./OrientacaoUploader";

export function Orientacoes() {
  const [selectedTab, setSelectedTab] = useState("listar");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadSuccess = () => {
    // Increment refresh key to trigger a refresh of the list
    setRefreshKey(prev => prev + 1);
    // Switch to list view after upload
    setSelectedTab("listar");
  };
  
  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="listar">Listar Orientações</TabsTrigger>
        <TabsTrigger value="adicionar">Adicionar Nova</TabsTrigger>
        <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="listar" className="space-y-4">
        <OrientacoesList key={refreshKey} />
      </TabsContent>
      
      <TabsContent value="adicionar" className="space-y-4">
        <OrientacaoUploader onSuccess={handleUploadSuccess} />
      </TabsContent>
      
      <TabsContent value="tarefas" className="space-y-4">
        <OrientacaoTarefas />
      </TabsContent>
    </Tabs>
  );
}
