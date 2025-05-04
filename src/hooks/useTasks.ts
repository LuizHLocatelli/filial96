
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { validateTaskStatus, validateTaskType, validatePriority } from "@/utils/typeValidation";

interface UseTasksProps {
  type?: string;
  status?: string;
}

export function useTasks({ type, status }: UseTasksProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Transform database data to Task type
  const transformTask = (taskData: any): Task => ({
    id: taskData.id,
    type: validateTaskType(taskData.type),
    title: taskData.title,
    description: taskData.description || "",
    status: validateTaskStatus(taskData.status),
    assignedTo: taskData.assigned_to,
    createdBy: taskData.created_by,
    createdAt: taskData.created_at,
    updatedAt: taskData.updated_at,
    dueDate: taskData.due_date,
    completedAt: taskData.completed_at,
    priority: validatePriority(taskData.priority),
    clientName: taskData.client_name,
    clientPhone: taskData.client_phone,
    clientAddress: taskData.client_address,
    clientCpf: taskData.client_cpf,
    notes: taskData.notes,
    products: taskData.notes, // Mapeando notes como products
    purchaseDate: taskData.purchase_date,
    expectedArrivalDate: taskData.expected_arrival_date,
    expectedDeliveryDate: taskData.expected_delivery_date,
    invoiceNumber: taskData.invoice_number,
  });

  // Fetch tasks with filters
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Apply filters if provided
      if (type) {
        query = query.eq("type", type);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to match our Task type
      const transformedTasks: Task[] = data.map(transformTask);

      setTasks(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Falha ao carregar tarefas");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change via drag and drop
  const handleStatusChange = async (task: Task, newStatus: string) => {
    if (task.status === newStatus) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);
        
      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `Tarefa agora está ${newStatus.replace('_', ' ')}`
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive"
      });
    }
  };

  // Set up initial fetch and realtime subscription
  useEffect(() => {
    // Initial fetch
    fetchTasks();

    // Set up real-time subscription with improved handling
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks'
        }, 
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          // Handle different event types more efficiently
          if (payload.eventType === 'INSERT') {
            const newTask = transformTask(payload.new);
            
            // Apply filters
            if ((type && newTask.type !== type) || (status && newTask.status !== status)) {
              return; // Skip tasks that don't match our filters
            }
            
            setTasks(currentTasks => [newTask, ...currentTasks]);
            
            toast({
              title: "Nova tarefa criada",
              description: "Uma nova tarefa foi adicionada à lista.",
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedTask = transformTask(payload.new);
            
            // Update the task if it matches our filters
            if ((!type || updatedTask.type === type) && (!status || updatedTask.status === status)) {
              setTasks(currentTasks => 
                currentTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
              );
              
              toast({
                title: "Tarefa atualizada",
                description: "Uma tarefa foi atualizada.",
              });
            } else {
              // If the task no longer matches our filters, remove it
              setTasks(currentTasks => 
                currentTasks.filter(task => task.id !== payload.new.id)
              );
            }
          } 
          else if (payload.eventType === 'DELETE') {
            // Remove the deleted task
            setTasks(currentTasks => 
              currentTasks.filter(task => task.id !== payload.old.id)
            );
            
            toast({
              title: "Tarefa removida",
              description: "Uma tarefa foi removida da lista.",
            });
          }
        })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, status, toast]);

  return {
    tasks,
    isLoading,
    error,
    draggedTask,
    setDraggedTask,
    handleStatusChange,
    refreshTasks: fetchTasks // Expose refresh function
  };
}
