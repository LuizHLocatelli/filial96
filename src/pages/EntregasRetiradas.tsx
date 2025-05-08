
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskFormDialog } from "@/components/tasks/dialogs/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { Task } from "@/types";
import { useTaskCounts } from "@/hooks/useTaskCounts";
import { useTaskDialogs } from "@/hooks/useTaskDialogs";
import { TaskStatisticsCards } from "@/components/entregas-retiradas/TaskStatisticsCards";
import { TasksTabsView } from "@/components/entregas-retiradas/TasksTabsView";
import { TaskActionButtons } from "@/components/entregas-retiradas/TaskActionButtons";
import { useTaskFromUrl } from "@/hooks/useTaskFromUrl";

export default function EntregasRetiradas() {
  const { toast } = useToast();
  const taskCounts = useTaskCounts();
  const [refreshKey, setRefreshKey] = useState(0);
  
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
    handleTaskSuccess,
    fetchTaskById
  } = useTaskDialogs();

  // Use the extracted hook for handling URL params
  useTaskFromUrl(
    setSelectedTask,
    setIsTaskDetailsOpen,
    setIsEditMode,
    setIsEntregaDialogOpen,
    setIsRetiradaDialogOpen
  );

  // Enhanced task success handler that triggers a refresh
  const handleEnhancedTaskSuccess = useCallback(() => {
    handleTaskSuccess();
    // Force list refresh by incrementing key
    setRefreshKey(prev => prev + 1);
  }, [handleTaskSuccess]);

  // Handle task creation success with redirection to task details
  const handleTaskCreationSuccess = useCallback(async (createdTaskId?: string) => {
    if (createdTaskId) {
      try {
        const task = await fetchTaskById(createdTaskId);
        if (task) {
          // Close any open dialogs
          setIsEntregaDialogOpen(false);
          setIsRetiradaDialogOpen(false);
          
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
      // Fallback to standard success handler if no taskId provided
      handleEnhancedTaskSuccess();
    }
  }, [fetchTaskById, setIsEntregaDialogOpen, setIsRetiradaDialogOpen, setSelectedTask, setIsTaskDetailsOpen]);

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
      // Force refresh of task list
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Entregas e Retiradas</h2>
        </div>
        <TaskActionButtons
          onCreateEntrega={() => handleCreateTask('entrega')}
          onCreateRetirada={() => handleCreateTask('retirada')}
        />
      </div>
      
      {/* Statistics Cards */}
      <TaskStatisticsCards taskCounts={taskCounts} />
      
      {/* Task List with Tabs */}
      <TasksTabsView 
        onTaskClick={handleTaskClick} 
        onEditTask={handleEditTask} 
        onDeleteTask={handleDeleteTask}
        refreshKey={refreshKey}
      />
      
      {/* Formulário de entrega */}
      <TaskFormDialog
        open={isEntregaDialogOpen}
        onOpenChange={handleDialogOpen(setIsEntregaDialogOpen)}
        taskId={taskId}
        initialData={selectedTask || {type: "entrega"}}
        isEditMode={isEditMode}
        onSuccess={handleTaskCreationSuccess}
      />
      
      {/* Formulário de retirada */}
      <TaskFormDialog
        open={isRetiradaDialogOpen}
        onOpenChange={handleDialogOpen(setIsRetiradaDialogOpen)}
        taskId={taskId}
        initialData={selectedTask || {type: "retirada"}}
        isEditMode={isEditMode}
        onSuccess={handleTaskCreationSuccess}
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
