
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
    <div className="w-full max-w-full overflow-hidden">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
            <TabsTrigger value="listar" className="text-xs sm:text-sm whitespace-nowrap">
              Listar Orientações
            </TabsTrigger>
            <TabsTrigger value="adicionar" className="text-xs sm:text-sm whitespace-nowrap">
              Adicionar Nova
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="text-xs sm:text-sm whitespace-nowrap">
              Tarefas
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="listar" className="space-y-4 w-full">
          <OrientacoesList key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="adicionar" className="space-y-4 w-full">
          <OrientacaoUploader onSuccess={handleUploadSuccess} />
        </TabsContent>
        
        <TabsContent value="tarefas" className="space-y-4 w-full">
          <OrientacaoTarefas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
