
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  type?: string;
  onTaskClick?: (task: Task) => void;
  className?: string;
}

export function TaskList({ type, onTaskClick, className = "" }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from("tasks")
          .select(`
            *,
            attachments (*)
          `)
          .order("created_at", { ascending: false });
        
        // Filter by task type if provided
        if (type) {
          query = query.eq("type", type);
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
          attachments: task.attachments,
          priority: task.priority,
          clientName: task.client_name,
          clientPhone: task.client_phone,
          clientAddress: task.client_address,
          notes: task.notes,
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
            .select(`
              *,
              attachments (*)
            `)
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
            attachments: task.attachments,
            priority: task.priority,
            clientName: task.client_name,
            clientPhone: task.client_phone,
            clientAddress: task.client_address,
            notes: task.notes,
          }));
          
          setTasks(transformedTasks);
          
          // Show a toast notification for new task
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Nova tarefa criada",
              description: "Uma nova tarefa foi adicionada à lista.",
            });
          }
        })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, toast]);

  // Handle task click
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border rounded-md p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="font-medium text-lg">Erro ao carregar tarefas</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          {type ? `Nenhuma tarefa de ${type} encontrada` : "Nenhuma tarefa encontrada"}
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
      ))}
    </div>
  );
}
