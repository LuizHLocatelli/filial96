
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";

export default function Cobrancas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const { toast } = useToast();

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      // Se estiver fechando o diálogo e não estamos no modo de edição
      if (!isEditMode) {
        setSelectedTask(null);
      }
      
      setIsDialogOpen(false);
      return;
    }
    
    if (!isEditMode) {
      // Generate a new task ID when dialog opens for new task
      setTaskId(uuidv4());
    }
    
    setIsDialogOpen(open);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskId(task.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso."
      });
      
      setSelectedTask(null);
      setIsTaskDetailsOpen(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Cobrança de Inadimplentes</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerenciamento de cobranças para clientes inadimplentes.
          </p>
        </div>
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto justify-center" 
          onClick={() => {
            setIsEditMode(false);
            setSelectedTask(null);
            handleDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova Cobrança
        </Button>
      </div>
      
      {/* Task creation/edit dialog */}
      <TaskFormDialog 
        open={isDialogOpen}
        onOpenChange={handleDialogOpen}
        taskId={taskId}
        initialData={selectedTask || undefined}
        isEditMode={isEditMode}
        onSuccess={() => {
          setSelectedTask(null);
          setIsEditMode(false);
        }}
      />
      
      {/* Task details dialog */}
      <TaskDetailsDialog
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        task={selectedTask}
        onEdit={() => {
          setIsEditMode(true);
          setIsTaskDetailsOpen(false);
          setIsDialogOpen(true);
        }}
        onDelete={handleDeleteTask}
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
            type="cobranca" 
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="pendente" className="mt-0">
          <TaskList 
            type="cobranca" 
            status="pendente"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-0">
          <TaskList 
            type="cobranca" 
            status="em_andamento"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="concluida" className="mt-0">
          <TaskList 
            type="cobranca" 
            status="concluida"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
