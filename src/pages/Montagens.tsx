
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
import { Task } from "@/types";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Montagens() {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [taskId, setTaskId] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState<string>("all");
  const { toast } = useToast();

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      // Se estiver fechando o diálogo e não estamos no modo de edição
      if (!isEditMode) {
        setSelectedTask(null);
      }
      
      setIsNewTaskDialogOpen(false);
      return;
    }
    
    if (!isEditMode) {
      // Generate a new task ID when dialog opens for new task
      setTaskId(uuidv4());
    }
    
    setIsNewTaskDialogOpen(open);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskId(task.id);
    setIsEditMode(true);
    setIsNewTaskDialogOpen(true);
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

  const handleTabChange = (value: string) => {
    setCurrentTabValue(value);
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Montagens</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie montagens de móveis para clientes.
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
          Nova Montagem
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-4 flex overflow-x-auto pb-1 sm:pb-0">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <TaskList 
            type="montagem" 
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="pendente" className="mt-0">
          <TaskList 
            type="montagem" 
            status="pendente"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-0">
          <TaskList 
            type="montagem" 
            status="em_andamento"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="concluida" className="mt-0">
          <TaskList 
            type="montagem" 
            status="concluida"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            className="mt-4"
          />
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para criar/editar montagem */}
      <TaskFormDialog
        open={isNewTaskDialogOpen}
        onOpenChange={handleDialogOpen}
        taskId={taskId}
        initialData={selectedTask || undefined}
        isEditMode={isEditMode}
        onSuccess={() => {
          setSelectedTask(null);
          setIsEditMode(false);
        }}
      />

      {/* Diálogo para detalhes da tarefa */}
      <TaskDetailsDialog
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        task={selectedTask}
        onEdit={() => {
          setIsEditMode(true);
          setIsTaskDetailsOpen(false);
          setIsNewTaskDialogOpen(true);
        }}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
