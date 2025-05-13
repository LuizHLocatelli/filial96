
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "./KanbanBoard";
import { StickyNotes } from "./StickyNotes";

export function Kanban() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Quadro de Tarefas e Anotações</h2>
        <p className="text-muted-foreground text-sm">
          Organize suas tarefas e faça anotações rápidas para o setor do crediário
        </p>
      </div>
      
      <Tabs defaultValue="kanban">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="kanban">Quadro Kanban</TabsTrigger>
          <TabsTrigger value="notes">Notas Rápidas</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard />
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <StickyNotes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
