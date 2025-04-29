
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/types";
import { Package, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Dados de exemplo para visualização
const mockDeliveries: Task[] = [
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
    dueDate: "2025-04-30T13:00:00"
  },
  {
    id: "2",
    type: "entrega",
    title: "Entrega de mesa de jantar com 6 cadeiras",
    description: "Entregar conjunto de mesa e cadeiras modelo Elegance. Cliente solicitou montagem no local.",
    status: "em_andamento",
    assignedTo: "user3",
    createdBy: "user1",
    createdAt: "2025-04-27T14:00:00",
    updatedAt: "2025-04-28T09:00:00",
    priority: "alta",
    clientName: "Ana Paula Souza",
    clientPhone: "(11) 92222-3333",
    clientAddress: "Av. Brasil, 500 - São Paulo",
    dueDate: "2025-04-29T10:00:00"
  },
  {
    id: "3",
    type: "retirada",
    title: "Retirada de geladeira com defeito",
    description: "Retirar geladeira com defeito para reparo em garantia.",
    status: "pendente",
    assignedTo: null,
    createdBy: "user2",
    createdAt: "2025-04-28T11:30:00",
    updatedAt: "2025-04-28T11:30:00",
    priority: "media",
    clientName: "Roberto Almeida",
    clientPhone: "(11) 94444-5555",
    clientAddress: "Rua Consolação, 800 - São Paulo",
    dueDate: "2025-05-02T14:00:00"
  },
];

export default function EntregasRetiradas() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };
  
  // Contagens para as entregas e retiradas
  const entregas = mockDeliveries.filter(t => t.type === "entrega");
  const retiradas = mockDeliveries.filter(t => t.type === "retirada");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Entregas e Retiradas</h2>
          <p className="text-muted-foreground">
            Gerencie entregas e retiradas de produtos da loja.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Entregas</CardTitle>
              <CardDescription>
                Total de {entregas.length} entregas agendadas
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
                <p className="text-xl font-bold">{entregas.filter(t => t.status === "pendente").length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Em andamento</p>
                <p className="text-xl font-bold">{entregas.filter(t => t.status === "em_andamento").length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Concluídas</p>
                <p className="text-xl font-bold">{entregas.filter(t => t.status === "concluida").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Retiradas</CardTitle>
              <CardDescription>
                Total de {retiradas.length} retiradas agendadas
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
                <p className="text-xl font-bold">{retiradas.filter(t => t.status === "pendente").length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Em andamento</p>
                <p className="text-xl font-bold">{retiradas.filter(t => t.status === "em_andamento").length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Concluídas</p>
                <p className="text-xl font-bold">{retiradas.filter(t => t.status === "concluida").length}</p>
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
                {mockDeliveries.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="entregas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDeliveries
                  .filter((task) => task.type === "entrega")
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="retiradas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDeliveries
                  .filter((task) => task.type === "retirada")
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Dialog para visualizar detalhes da tarefa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedTask && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>
                Detalhes da tarefa selecionada
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{selectedTask.status.replace("_", " ")}</span>
              </div>
              <div>
                <span className="font-medium">Descrição:</span>
                <p className="mt-1 text-sm text-muted-foreground">{selectedTask.description}</p>
              </div>
              {selectedTask.clientName && (
                <div>
                  <span className="font-medium">Cliente:</span>
                  <p className="mt-1 text-sm">{selectedTask.clientName}</p>
                  {selectedTask.clientPhone && (
                    <p className="text-sm">{selectedTask.clientPhone}</p>
                  )}
                  {selectedTask.clientAddress && (
                    <p className="text-sm text-muted-foreground">{selectedTask.clientAddress}</p>
                  )}
                </div>
              )}
              <div>
                <span className="font-medium">Prioridade:</span>
                <p className="mt-1 text-sm capitalize">{selectedTask.priority}</p>
              </div>
              {selectedTask.dueDate && (
                <div>
                  <span className="font-medium">Data Prevista:</span>
                  <p className="mt-1 text-sm">
                    {new Date(selectedTask.dueDate).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
