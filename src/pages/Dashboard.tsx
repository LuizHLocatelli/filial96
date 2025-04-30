
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ClipboardCheck, FileWarning, Package, Users, Calendar, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/types";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskCounts, setTaskCounts] = useState({
    entrega: 0,
    retirada: 0,
    montagem: 0,
    garantia: 0,
    organizacao: 0,
    cobranca: 0
  });
  const [statusCounts, setStatusCounts] = useState({
    pendente: 0,
    em_andamento: 0,
    concluida: 0
  });
  const { toast } = useToast();
  
  // Fetch tasks and counts on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("tasks")
          .select(`
            *,
            attachments (*)
          `)
          .order("created_at", { ascending: false })
          .limit(10);

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
        
        // Calculate counts
        const typeCount = {
          entrega: 0,
          retirada: 0,
          montagem: 0,
          garantia: 0,
          organizacao: 0,
          cobranca: 0
        };
        
        const statusCount = {
          pendente: 0,
          em_andamento: 0,
          concluida: 0
        };
        
        data.forEach((task: any) => {
          // Count by type
          if (typeCount.hasOwnProperty(task.type)) {
            typeCount[task.type as keyof typeof typeCount]++;
          }
          
          // Count by status
          if (statusCount.hasOwnProperty(task.status)) {
            statusCount[task.status as keyof typeof statusCount]++;
          }
        });
        
        setTaskCounts(typeCount);
        setStatusCounts(statusCount);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as tarefas."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks'
        }, 
        () => {
          // Refetch all data when any change occurs
          fetchTasks();
          
          // Notify users of changes
          toast({
            title: "Dados atualizados",
            description: "Novas informações disponíveis no dashboard.",
          });
        })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    toast({
      title: "Tarefa selecionada",
      description: `Você selecionou a tarefa: ${task.title}`,
    });
  };
  
  // Calculate total
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral das atividades e progresso da loja.
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Entregas Pendentes"
            value={taskCounts.entrega}
            icon={<Package className="h-5 w-5" />}
            description="Entregas agendadas"
            trend={{ value: 0, isPositive: true }}
          />
          <DashboardCard
            title="Montagens"
            value={taskCounts.montagem}
            icon={<ClipboardCheck className="h-5 w-5" />}
            description="Montagens programadas"
            trend={{ value: 0, isPositive: true }}
          />
          <DashboardCard
            title="Garantias"
            value={taskCounts.garantia}
            icon={<FileWarning className="h-5 w-5" />}
            description="Garantias em processo"
            trend={{ value: 0, isPositive: false }}
          />
          <DashboardCard
            title="Cobranças"
            value={taskCounts.cobranca}
            icon={<Users className="h-5 w-5" />}
            description="Clientes em cobrança"
            trend={{ value: 0, isPositive: false }}
          />
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas tarefas criadas ou atualizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4 w-full">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="progress">Em Andamento</TabsTrigger>
                <TabsTrigger value="completed">Concluídas</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Nenhuma tarefa encontrada</p>
                )}
              </TabsContent>
              <TabsContent value="pending" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    tasks
                      .filter((task) => task.status === "pendente")
                      .map((task) => (
                        <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                      ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="progress" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    tasks
                      .filter((task) => task.status === "em_andamento")
                      .map((task) => (
                        <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                      ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    tasks
                      .filter((task) => task.status === "concluida")
                      .map((task) => (
                        <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                      ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
            <CardDescription>
              Distribuição das tarefas por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 w-5 h-5 rounded bg-yellow-400"></div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      Pendentes
                    </p>
                    <div className="h-2 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: totalTasks ? `${(statusCounts.pendente / totalTasks) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <span className="font-bold">{statusCounts.pendente}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-4 w-5 h-5 rounded bg-brand-blue-500"></div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      Em Andamento
                    </p>
                    <div className="h-2 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-brand-blue-500"
                        style={{ width: totalTasks ? `${(statusCounts.em_andamento / totalTasks) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <span className="font-bold">{statusCounts.em_andamento}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-4 w-5 h-5 rounded bg-green-500"></div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      Concluídas
                    </p>
                    <div className="h-2 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: totalTasks ? `${(statusCounts.concluida / totalTasks) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <span className="font-bold">{statusCounts.concluida}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Agenda de Hoje</h4>
              {isLoading ? (
                <div className="flex flex-col space-y-2 mt-2">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center p-2 bg-muted/50 rounded-md">
                      <Skeleton className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col space-y-2 mt-2">
                  {tasks.filter(t => t.status === 'pendente').slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-center p-2 bg-muted/50 rounded-md">
                      {task.type === 'entrega' ? (
                        <Package className="h-4 w-4 mr-2 text-brand-blue-600" />
                      ) : (
                        <Calendar className="h-4 w-4 mr-2 text-brand-blue-600" />
                      )}
                      <div className="flex-1">
                        <span className="text-sm">{task.title}</span>
                        <p className="text-xs text-muted-foreground">
                          {task.clientName || "Cliente não especificado"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'pendente').length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Nenhuma tarefa pendente hoje</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
