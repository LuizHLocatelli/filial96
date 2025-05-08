
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
import { Task } from "@/types";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskFormDialog } from "@/components/tasks/dialogs/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateTaskType, validateTaskStatus, validatePriority } from "@/utils/typeValidation";

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
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Fetch task by ID function
  const fetchTaskById = async (taskId: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
        
      if (error) {
        console.error("Error fetching task:", error);
        return null;
      }
      
      if (data) {
        // Transform data to Task format
        const task: Task = {
          id: data.id,
          type: validateTaskType(data.type),
          title: data.title,
          description: data.description || "",
          status: validateTaskStatus(data.status),
          assignedTo: data.assigned_to,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dueDate: data.due_date,
          completedAt: data.completed_at,
          priority: validatePriority(data.priority),
          clientName: data.client_name,
          clientPhone: data.client_phone,
          clientAddress: data.client_address,
          clientCpf: data.client_cpf,
          notes: data.notes,
          products: data.notes, // Mapping notes as products
          purchaseDate: data.purchase_date,
          expectedArrivalDate: data.expected_arrival_date,
          expectedDeliveryDate: data.expected_delivery_date,
          invoiceNumber: data.invoice_number,
        };
        
        return task;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching task:", error);
      return null;
    }
  };

  // Handle task creation success with redirection to task details
  const handleTaskCreationSuccess = useCallback(async (createdTaskId?: string) => {
    if (createdTaskId) {
      try {
        const task = await fetchTaskById(createdTaskId);
        if (task) {
          // Close task dialog
          setIsNewTaskDialogOpen(false);
          
          // Set the selected task and show details
          setSelectedTask(task);
          setIsTaskDetailsOpen(true);
          
          // Refresh the task list
          setRefreshKey(prev => prev + 1);
        }
      } catch (error) {
        console.error("Error fetching created task:", error);
      }
    } else {
      // Standard success handling if no taskId provided
      setIsNewTaskDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    }
  }, []);

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
      setRefreshKey(prev => prev + 1);
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
            refreshKey={refreshKey}
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
            refreshKey={refreshKey}
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
            refreshKey={refreshKey}
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
            refreshKey={refreshKey}
          />
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para criar/editar montagem */}
      <TaskFormDialog
        open={isNewTaskDialogOpen}
        onOpenChange={handleDialogOpen}
        taskId={taskId}
        initialData={selectedTask || {type: "montagem"}}
        isEditMode={isEditMode}
        onSuccess={handleTaskCreationSuccess}
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
