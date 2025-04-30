
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/tasks/TaskList";
import { Task } from "@/types";

interface TasksTabsViewProps {
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function TasksTabsView({ onTaskClick, onEditTask, onDeleteTask }: TasksTabsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Tarefas</CardTitle>
        <CardDescription>
          Visualize e gerencie todas as entregas e retiradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="entregas">Entregas</TabsTrigger>
            <TabsTrigger value="retiradas">Retiradas</TabsTrigger>
          </TabsList>
          <TabsContent value="todas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaskList 
                onTaskClick={onTaskClick} 
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          </TabsContent>
          <TabsContent value="entregas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaskList 
                type="entrega" 
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          </TabsContent>
          <TabsContent value="retiradas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaskList 
                type="retirada" 
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
