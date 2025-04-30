
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Garantias() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Garantias</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Acompanhamento de processos de garantia de produtos.
          </p>
        </div>
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto justify-center" 
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Garantia
        </Button>
      </div>
      
      {/* Task creation dialog */}
      <CreateTaskDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        taskType="garantia"
        title="Garantia"
      />
      
      {/* Task list with tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 flex overflow-x-auto pb-1 sm:pb-0">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <TaskList 
            type="garantia" 
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="pendente" className="mt-0">
          <TaskList 
            type="garantia" 
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-0">
          <TaskList 
            type="garantia" 
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="concluida" className="mt-0">
          <TaskList 
            type="garantia" 
            className="mt-4"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
