
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function useTaskDialogs() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isRetiradaDialogOpen, setIsRetiradaDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Compute taskId only when needed
  const taskId = selectedTask?.id;

  // Handle dialog open state change
  const handleDialogOpen = (setStateFunc: (state: boolean) => void) => (open: boolean) => {
    setStateFunc(open);
    // Clear selected task when closing a dialog
    if (!open) {
      // Clear URL parameters when closing dialog
      const url = new URL(window.location.href);
      url.searchParams.delete('taskId');
      url.searchParams.delete('action');
      navigate(url.pathname + url.search, { replace: true });
    }
  };

  // Handle task click to view details
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
    
    // Update URL with task ID and action
    const url = new URL(window.location.href);
    url.searchParams.set('taskId', task.id);
    url.searchParams.set('action', 'view');
    navigate(url.pathname + url.search, { replace: true });
  }, [navigate]);

  // Handle edit task button click
  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditMode(true);
    setIsTaskDetailsOpen(false);
    
    if (task.type === 'entrega') {
      setIsEntregaDialogOpen(true);
    } else if (task.type === 'retirada') {
      setIsRetiradaDialogOpen(true);
    }
    
    // Update URL with task ID and action
    const url = new URL(window.location.href);
    url.searchParams.set('taskId', task.id);
    url.searchParams.set('action', 'edit');
    navigate(url.pathname + url.search, { replace: true });
  }, [navigate]);

  // Handle create new task
  const handleCreateTask = useCallback((type: 'entrega' | 'retirada') => {
    setSelectedTask(null);
    setIsEditMode(false);
    
    if (type === 'entrega') {
      setIsEntregaDialogOpen(true);
    } else if (type === 'retirada') {
      setIsRetiradaDialogOpen(true);
    }
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('taskId');
    url.searchParams.delete('action');
    navigate(url.pathname + url.search, { replace: true });
  }, [navigate]);

  // Handle task success (create/update)
  const handleTaskSuccess = useCallback(() => {
    // Clear selected task
    setSelectedTask(null);
    setIsEditMode(false);
    
    // Close dialogs
    setIsEntregaDialogOpen(false);
    setIsRetiradaDialogOpen(false);
    
    // Show success toast based on edit mode
    toast({
      title: isEditMode ? "Tarefa atualizada" : "Tarefa criada",
      description: isEditMode 
        ? "A tarefa foi atualizada com sucesso" 
        : "A nova tarefa foi criada com sucesso",
    });
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('taskId');
    url.searchParams.delete('action');
    navigate(url.pathname + url.search, { replace: true });
  }, [isEditMode, toast, navigate]);

  return {
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
  };
}
