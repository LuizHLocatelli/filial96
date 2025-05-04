
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Package, Plus, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TaskFormDialog } from "@/components/tasks/dialogs/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { Task } from "@/types";
import { useTaskCounts } from "@/hooks/useTaskCounts";
import { useTaskDialogs } from "@/hooks/useTaskDialogs";
import { TaskStatisticsCards } from "@/components/entregas-retiradas/TaskStatisticsCards";
import { TasksTabsView } from "@/components/entregas-retiradas/TasksTabsView";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function EntregasRetiradas() {
  const { toast } = useToast();
  const taskCounts = useTaskCounts();
  const location = useLocation();
  
  const {
    selectedTask,
    isTaskDetailsOpen,
    isEntregaDialogOpen,
    isRetiradaDialogOpen,
    isEditMode,
    taskId,
    setIsTaskDetailsOpen,
    setIsEntregaDialogOpen,
    setIsRetiradaDialogOpen,
    setSelectedTask,
    setIsEditMode,
    handleDialogOpen,
    handleTaskClick,
    handleEditTask,
    handleCreateTask,
    handleTaskSuccess
  } = useTaskDialogs();

  // Efeito para verificar os parâmetros de URL quando a página é carregada
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const taskIdFromUrl = queryParams.get("taskId");
    const action = queryParams.get("action");
    
    if (taskIdFromUrl) {
      // Buscar a tarefa pelo ID
      const fetchTask = async () => {
        try {
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("id", taskIdFromUrl)
            .single();
            
          if (error) {
            console.error("Erro ao buscar tarefa:", error);
            return;
          }
          
          if (data) {
            // Transformar os dados para o formato da Task
            const task: Task = {
              id: data.id,
              type: data.type,
              title: data.title,
              description: data.description || "",
              status: data.status,
              assignedTo: data.assigned_to,
              createdBy: data.created_by,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              dueDate: data.due_date,
              completedAt: data.completed_at,
              priority: data.priority,
              clientName: data.client_name,
              clientPhone: data.client_phone,
              clientAddress: data.client_address,
              clientCpf: data.client_cpf,
              notes: data.notes,
              products: data.notes, // Mapeando notes como products
              purchaseDate: data.purchase_date,
              expectedArrivalDate: data.expected_arrival_date,
              expectedDeliveryDate: data.expected_delivery_date,
              invoiceNumber: data.invoice_number,
            };
            
            setSelectedTask(task);
            
            // Abrir o diálogo apropriado com base no parâmetro de ação
            if (action === "view") {
              setIsTaskDetailsOpen(true);
            } else if (action === "edit") {
              setIsEditMode(true);
              if (task.type === 'entrega') {
                setIsEntregaDialogOpen(true);
              } else if (task.type === 'retirada') {
                setIsRetiradaDialogOpen(true);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao buscar tarefa:", error);
        }
      };
      
      fetchTask();
    }
  }, [location.search]);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Entregas e Retiradas</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie entregas e retiradas de produtos da loja.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="flex items-center gap-2 justify-center" 
            onClick={() => handleCreateTask('entrega')}
          >
            <Truck className="h-4 w-4" />
            Nova Entrega
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2 justify-center" 
            onClick={() => handleCreateTask('retirada')}
          >
            <Package className="h-4 w-4" />
            Nova Retirada
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <TaskStatisticsCards taskCounts={taskCounts} />
      
      {/* Task List with Tabs */}
      <TasksTabsView 
        onTaskClick={handleTaskClick} 
        onEditTask={handleEditTask} 
        onDeleteTask={handleDeleteTask}
      />
      
      {/* Formulário de entrega */}
      <TaskFormDialog
        open={isEntregaDialogOpen}
        onOpenChange={handleDialogOpen(setIsEntregaDialogOpen)}
        taskId={taskId}
        initialData={selectedTask || {type: "entrega"}}
        isEditMode={isEditMode}
        onSuccess={handleTaskSuccess}
      />
      
      {/* Formulário de retirada */}
      <TaskFormDialog
        open={isRetiradaDialogOpen}
        onOpenChange={handleDialogOpen(setIsRetiradaDialogOpen)}
        taskId={taskId}
        initialData={selectedTask || {type: "retirada"}}
        isEditMode={isEditMode}
        onSuccess={handleTaskSuccess}
      />
      
      {/* Dialog para visualizar detalhes da tarefa */}
      <TaskDetailsDialog
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        task={selectedTask}
        onEdit={() => {
          setIsEditMode(true);
          setIsTaskDetailsOpen(false);
          
          if (selectedTask?.type === 'entrega') {
            setIsEntregaDialogOpen(true);
          } else if (selectedTask?.type === 'retirada') {
            setIsRetiradaDialogOpen(true);
          }
        }}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
