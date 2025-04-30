
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types";
import { Package, Plus, Truck } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { v4 as uuidv4 } from "uuid";

export default function EntregasRetiradas() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isRetiradaDialogOpen, setIsRetiradaDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const { toast } = useToast();
  const [taskCounts, setTaskCounts] = useState({
    entregas: {
      pendente: 0,
      em_andamento: 0,
      concluida: 0,
      total: 0
    },
    retiradas: {
      pendente: 0,
      em_andamento: 0,
      concluida: 0,
      total: 0
    }
  });
  
  // Fetch task counts
  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        // Get counts for entregas
        const { data: entregas, error: entregasError } = await supabase
          .from("tasks")
          .select("status")
          .eq("type", "entrega");
        
        if (entregasError) throw entregasError;
        
        // Get counts for retiradas
        const { data: retiradas, error: retiradasError } = await supabase
          .from("tasks")
          .select("status")
          .eq("type", "retirada");
          
        if (retiradasError) throw retiradasError;
        
        // Calculate counts
        const entregasCounts = {
          pendente: entregas?.filter(t => t.status === "pendente").length || 0,
          em_andamento: entregas?.filter(t => t.status === "em_andamento").length || 0,
          concluida: entregas?.filter(t => t.status === "concluida").length || 0,
          total: entregas?.length || 0
        };
        
        const retiradasCounts = {
          pendente: retiradas?.filter(t => t.status === "pendente").length || 0,
          em_andamento: retiradas?.filter(t => t.status === "em_andamento").length || 0,
          concluida: retiradas?.filter(t => t.status === "concluida").length || 0,
          total: retiradas?.length || 0
        };
        
        setTaskCounts({
          entregas: entregasCounts,
          retiradas: retiradasCounts
        });
      } catch (error) {
        console.error("Erro ao carregar contagens de tarefas:", error);
      }
    };
    
    fetchTaskCounts();
    
    // Subscribe to changes in the tasks table
    const channel = supabase
      .channel('task-counts-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: "type=eq.entrega OR type=eq.retirada"
        }, 
        () => {
          fetchTaskCounts();
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleDialogOpen = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return (open: boolean) => {
      if (!open) {
        // Se estiver fechando o diálogo e não estamos no modo de edição
        if (!isEditMode) {
          setSelectedTask(null);
        }
        
        dialogSetter(false);
        return;
      }
      
      if (!isEditMode) {
        // Generate a new task ID when dialog opens for new task
        setTaskId(uuidv4());
      }
      
      dialogSetter(open);
    };
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskId(task.id);
    setIsEditMode(true);
    
    if (task.type === 'entrega') {
      setIsEntregaDialogOpen(true);
    } else if (task.type === 'retirada') {
      setIsRetiradaDialogOpen(true);
    }
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
            onClick={() => {
              setIsEditMode(false);
              setSelectedTask(null);
              handleDialogOpen(setIsEntregaDialogOpen)(true);
            }}
          >
            <Truck className="h-4 w-4" />
            Nova Entrega
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2 justify-center" 
            onClick={() => {
              setIsEditMode(false);
              setSelectedTask(null);
              handleDialogOpen(setIsRetiradaDialogOpen)(true);
            }}
          >
            <Package className="h-4 w-4" />
            Nova Retirada
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Entregas</CardTitle>
              <CardDescription>
                Total de {taskCounts.entregas.total} entregas agendadas
              </CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-brand-blue-100 p-2 flex items-center justify-center">
              <Truck className="h-7 w-7 text-brand-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold">{taskCounts.entregas.pendente}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Em andamento</p>
                <p className="text-xl font-bold">{taskCounts.entregas.em_andamento}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Concluídas</p>
                <p className="text-xl font-bold">{taskCounts.entregas.concluida}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Retiradas</CardTitle>
              <CardDescription>
                Total de {taskCounts.retiradas.total} retiradas agendadas
              </CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 p-2 flex items-center justify-center">
              <Package className="h-7 w-7 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold">{taskCounts.retiradas.pendente}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Em andamento</p>
                <p className="text-xl font-bold">{taskCounts.retiradas.em_andamento}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Concluídas</p>
                <p className="text-xl font-bold">{taskCounts.retiradas.concluida}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tarefas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as entregas e retiradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="entregas">Entregas</TabsTrigger>
              <TabsTrigger value="retiradas">Retiradas</TabsTrigger>
            </TabsList>
            <TabsContent value="todas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskList 
                  onTaskClick={handleTaskClick} 
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            </TabsContent>
            <TabsContent value="entregas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskList 
                  type="entrega" 
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            </TabsContent>
            <TabsContent value="retiradas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskList 
                  type="retirada" 
                  onTaskClick={handleTaskClick}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Formulário de entrega */}
      <TaskFormDialog
        open={isEntregaDialogOpen}
        onOpenChange={handleDialogOpen(setIsEntregaDialogOpen)}
        taskId={taskId}
        initialData={selectedTask || {type: "entrega"}}
        isEditMode={isEditMode}
        onSuccess={() => {
          setSelectedTask(null);
          setIsEditMode(false);
        }}
      />
      
      {/* Formulário de retirada */}
      <TaskFormDialog
        open={isRetiradaDialogOpen}
        onOpenChange={handleDialogOpen(setIsRetiradaDialogOpen)}
        taskId={taskId}
        initialData={selectedTask || {type: "retirada"}}
        isEditMode={isEditMode}
        onSuccess={() => {
          setSelectedTask(null);
          setIsEditMode(false);
        }}
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
