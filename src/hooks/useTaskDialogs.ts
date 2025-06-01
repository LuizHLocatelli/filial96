import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Task, TaskType, TaskStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateTaskType, validateTaskStatus, validatePriority } from "@/utils/typeValidation";

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

  // Fetch task by ID
  const fetchTaskById = useCallback(async (taskId: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
        
      if (error) {
        console.error("Erro ao buscar tarefa:", error);
        return null;
      }
      
      if (data) {
        // Validate task type before assignment
        const taskType: TaskType = validateTaskType(data.type);
        
        // Validate task status before assignment
        const taskStatus: TaskStatus = validateTaskStatus(data.status);
        
        // Validate priority before assignment
        const priority: 'baixa' | 'media' | 'alta' = validatePriority(data.priority);
        
        // Transform data to Task format
        const task: Task = {
          id: data.id,
          type: taskType,
          title: data.title,
          description: data.description || "",
          status: taskStatus,
          assignedTo: data.assigned_to,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dueDate: data.due_date,
          completedAt: data.completed_at,
          priority: priority,
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
      console.error("Erro ao buscar tarefa:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      duration: 4000,
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
    handleTaskSuccess,
    fetchTaskById
  };
}
