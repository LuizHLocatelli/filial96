
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskType, TaskStatus } from "@/types";
import { validateTaskType, validateTaskStatus, validatePriority } from "@/utils/typeValidation";

interface UseTasksProps {
  type?: string;
  status?: string;
  refreshKey?: number; // Add refreshKey prop for forcing refetch
}

export function useTasks({ type, status, refreshKey = 0 }: UseTasksProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('tasks').select('*');

        if (type) {
          query = query.eq('type', type);
        }

        if (status) {
          query = query.eq('status', status);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }

        // Validate and transform data
        const typedTasks: Task[] = data.map(item => {
          // Validate task type before assignment
          const taskType: TaskType = validateTaskType(item.type);
          
          // Validate task status before assignment
          const taskStatus: TaskStatus = validateTaskStatus(item.status);
          
          // Validate priority before assignment
          const priority: 'baixa' | 'media' | 'alta' = validatePriority(item.priority);
          
          return {
            id: item.id,
            type: taskType,
            title: item.title,
            description: item.description || "",
            status: taskStatus,
            priority: priority,
            assignedTo: item.assigned_to,
            createdBy: item.created_by,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            dueDate: item.due_date,
            completedAt: item.completed_at,
            clientName: item.client_name,
            clientPhone: item.client_phone,
            clientAddress: item.client_address,
            clientCpf: item.client_cpf,
            notes: item.notes,
            products: item.notes, // Usando notes para armazenar produtos
            purchaseDate: item.purchase_date,
            expectedArrivalDate: item.expected_arrival_date,
            expectedDeliveryDate: item.expected_delivery_date,
            invoiceNumber: item.invoice_number,
          };
        });

        setTasks(typedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [type, status, refreshKey]); // Added refreshKey to dependencies

  // Handle task status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // First update local state for immediate feedback
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Then update in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update on error
      // Refetch tasks to ensure data integrity
      const { data } = await supabase.from('tasks').select('*').eq('id', taskId);
      if (data && data[0]) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: validateTaskStatus(data[0].status) } : task
          )
        );
      }
    }
  };

  return {
    tasks,
    isLoading,
    error,
    draggedTask,
    setDraggedTask,
    handleStatusChange,
  };
}
