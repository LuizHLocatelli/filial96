
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";

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

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });
        
        // Filter by task type if provided
        if (type) {
          query = query.eq("type", type);
        }

        // Filter by status if provided
        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Transform the data to match our Task type
        const transformedTasks: Task[] = data.map((task: any) => ({
          id: task.id,
          type: task.type,
          title: task.title,
          description: task.description || "",
          status: task.status,
          assignedTo: task.assigned_to,
          createdBy: task.created_by,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          dueDate: task.due_date,
          completedAt: task.completed_at,
          priority: task.priority,
          clientName: task.client_name,
          clientPhone: task.client_phone,
          clientAddress: task.client_address,
          clientCpf: task.client_cpf,
          notes: task.notes,
          products: task.notes, // Mapeando notes como products
          purchaseDate: task.purchase_date,
          expectedArrivalDate: task.expected_arrival_date,
          expectedDeliveryDate: task.expected_delivery_date,
        }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Falha ao carregar tarefas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();

    // Set up real-time subscription
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
          
          // Refetch all tasks when any change occurs
          const { data: newData, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false });
            
          if (error) {
            console.error("Error fetching updated tasks:", error);
            return;
          }
          
          // Transform the data
          const transformedTasks: Task[] = newData.map((task: any) => ({
            id: task.id,
            type: task.type,
            title: task.title,
            description: task.description || "",
            status: task.status,
            assignedTo: task.assigned_to,
            createdBy: task.created_by,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            dueDate: task.due_date,
            completedAt: task.completed_at,
            priority: task.priority,
            clientName: task.client_name,
            clientPhone: task.client_phone,
            clientAddress: task.client_address,
            clientCpf: task.client_cpf,
            notes: task.notes,
            products: task.notes, // Mapeando notes como products
            purchaseDate: task.purchase_date,
            expectedArrivalDate: task.expected_arrival_date,
            expectedDeliveryDate: task.expected_delivery_date,
          }));
          
          setTasks(transformedTasks);
          
          // Show a toast notification for new task
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Nova tarefa criada",
              description: "Uma nova tarefa foi adicionada à lista.",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Tarefa removida",
              description: "Uma tarefa foi removida da lista.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Tarefa atualizada",
              description: "Uma tarefa foi atualizada.",
            });
          }
        })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, status, toast]);

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

  return {
    tasks,
    isLoading,
    error,
    draggedTask,
    setDraggedTask,
    handleStatusChange
  };
}
