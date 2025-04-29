
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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Dados de exemplo para visualização
const mockTasks: Task[] = [
  {
    id: "1",
    type: "entrega",
    title: "Entrega de sofá 3 lugares",
    description: "Entregar sofá modelo Milano na casa do cliente. Agendado para a tarde.",
    status: "pendente",
    assignedTo: "user2",
    createdBy: "user1",
    createdAt: "2025-04-28T10:00:00",
    updatedAt: "2025-04-28T10:00:00",
    priority: "media",
    clientName: "João Silva",
    clientPhone: "(11) 98765-4321",
    clientAddress: "Rua das Flores, 123 - São Paulo",
  },
  {
    id: "2",
    type: "montagem",
    title: "Montagem de guarda-roupa",
    description: "Montar guarda-roupa 6 portas modelo Paris. Cliente já confirmou disponibilidade.",
    status: "em_andamento",
    assignedTo: "user3",
    createdBy: "user1",
    createdAt: "2025-04-27T14:30:00",
    updatedAt: "2025-04-27T16:15:00",
    priority: "alta",
    clientName: "Maria Oliveira",
    clientPhone: "(11) 91234-5678",
    clientAddress: "Av. Paulista, 1000 - São Paulo",
  },
  {
    id: "3",
    type: "garantia",
    title: "Defeito em geladeira",
    description: "Cliente relatou problemas no congelador. Verificar e acionar garantia.",
    status: "pendente",
    assignedTo: null,
    createdBy: "user2",
    createdAt: "2025-04-26T09:15:00",
    updatedAt: "2025-04-26T09:15:00",
    priority: "alta",
    clientName: "Pedro Santos",
    clientPhone: "(11) 97777-8888",
    clientAddress: "Rua Augusta, 500 - São Paulo",
  },
  {
    id: "4",
    type: "organizacao",
    title: "Organizar vitrine de sala",
    description: "Atualizar a vitrine principal com os móveis da nova coleção.",
    status: "concluida",
    assignedTo: "user4",
    createdBy: "user1",
    createdAt: "2025-04-25T11:00:00",
    updatedAt: "2025-04-25T14:30:00",
    completedAt: "2025-04-25T14:30:00",
    priority: "media",
  },
  {
    id: "5",
    type: "cobranca",
    title: "Cobrança cliente inadimplente",
    description: "Contatar cliente com 3 parcelas atrasadas e negociar pagamento.",
    status: "pendente",
    assignedTo: "user5",
    createdBy: "user1",
    createdAt: "2025-04-28T09:00:00",
    updatedAt: "2025-04-28T09:00:00",
    priority: "alta",
    clientName: "Ana Ferreira",
    clientPhone: "(11) 95555-6666",
    notes: "Cliente já foi contatado 2 vezes. Prometeu pagamento para o dia 05/05.",
  },
];

export default function Dashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    toast({
      title: "Tarefa selecionada",
      description: `Você selecionou a tarefa: ${task.title}`,
    });
  };
  
  // Simula contagem das tarefas por status
  const pendingTasks = mockTasks.filter(t => t.status === "pendente").length;
  const inProgressTasks = mockTasks.filter(t => t.status === "em_andamento").length;
  const completedTasks = mockTasks.filter(t => t.status === "concluida").length;
  
  // Simula contagem das tarefas por tipo
  const countByType = (type: string) => mockTasks.filter(t => t.type === type).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral das atividades e progresso da loja.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Entregas Pendentes"
          value={countByType("entrega")}
          icon={<Package className="h-5 w-5" />}
          description="Entregas agendadas"
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Montagens"
          value={countByType("montagem")}
          icon={<ClipboardCheck className="h-5 w-5" />}
          description="Montagens programadas"
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="Garantias"
          value={countByType("garantia")}
          icon={<FileWarning className="h-5 w-5" />}
          description="Garantias em processo"
          trend={{ value: 3, isPositive: false }}
        />
        <DashboardCard
          title="Cobranças"
          value={countByType("cobranca")}
          icon={<Users className="h-5 w-5" />}
          description="Clientes em cobrança"
          trend={{ value: 8, isPositive: false }}
        />
      </div>
      
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
                <div className="grid grid-cols-1 gap-4">
                  {mockTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {mockTasks
                    .filter((task) => task.status === "pendente")
                    .map((task) => (
                      <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="progress" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {mockTasks
                    .filter((task) => task.status === "em_andamento")
                    .map((task) => (
                      <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {mockTasks
                    .filter((task) => task.status === "concluida")
                    .map((task) => (
                      <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                    ))}
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
                      style={{ width: `${(pendingTasks / mockTasks.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-bold">{pendingTasks}</span>
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
                      style={{ width: `${(inProgressTasks / mockTasks.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-bold">{inProgressTasks}</span>
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
                      style={{ width: `${(completedTasks / mockTasks.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-bold">{completedTasks}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Agenda de Hoje</h4>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center p-2 bg-muted/50 rounded-md">
                  <Calendar className="h-4 w-4 mr-2 text-brand-blue-600" />
                  <div className="flex-1">
                    <span className="text-sm">Entrega - João Silva</span>
                    <p className="text-xs text-muted-foreground">13:00 - 15:00</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-muted/50 rounded-md">
                  <Clock className="h-4 w-4 mr-2 text-brand-blue-600" />
                  <div className="flex-1">
                    <span className="text-sm">Montagem - Maria Oliveira</span>
                    <p className="text-xs text-muted-foreground">15:30 - 17:30</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
