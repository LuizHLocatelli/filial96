
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Montagens() {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState<string>("all");
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: "montagem",
    title: "",
    description: "",
    status: "pendente",
    priority: "media",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setNewTask({
      type: "montagem",
      title: "",
      description: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
    });
    setTaskId("");
    setIsEditMode(false);
  };

  const handleDialogOpen = (open: boolean) => {
    if (open && !isEditMode) {
      // Generate a new task ID when dialog opens for new task
      setTaskId(uuidv4());
    } else if (!open) {
      // Reset form when dialog closes
      resetForm();
    }
    setIsNewTaskDialogOpen(open);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskId(task.id);
    setNewTask({
      type: task.type,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      clientName: task.clientName,
      clientPhone: task.clientPhone,
      clientAddress: task.clientAddress,
    });
    setIsEditMode(true);
    setIsNewTaskDialogOpen(true);
  };

  const handleCreateOrUpdateTask = async () => {
    if (!newTask.title) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a montagem.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma montagem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        // Atualizar tarefa existente
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            client_name: newTask.clientName,
            client_phone: newTask.clientPhone,
            client_address: newTask.clientAddress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);
          
        if (updateError) {
          throw new Error(`Erro ao atualizar tarefa: ${updateError.message}`);
        }
        
        toast({
          title: "Montagem atualizada",
          description: "A montagem foi atualizada com sucesso.",
        });
      } else {
        // Criar nova tarefa com o taskId gerado quando o diálogo foi aberto
        const { error: taskError } = await supabase
          .from("tasks")
          .insert({
            id: taskId, 
            type: newTask.type,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            client_name: newTask.clientName,
            client_phone: newTask.clientPhone,
            client_address: newTask.clientAddress,
            created_by: user.id, 
          });
        
        if (taskError) {
          throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
        }
        
        toast({
          title: "Montagem criada",
          description: "A nova montagem foi criada com sucesso.",
        });
      }
      
      // Limpar o formulário e fechar o diálogo
      resetForm();
      setIsNewTaskDialogOpen(false);
      
    } catch (error) {
      console.error("Erro ao salvar montagem:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a montagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setCurrentTabValue(value);
  };

  const getTaskStatus = () => {
    if (currentTabValue === "all") return undefined;
    return currentTabValue;
  };
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Montagens</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie montagens de móveis para clientes.
          </p>
        </div>
        <Button 
          className="flex items-center gap-2 w-full sm:w-auto justify-center" 
          onClick={() => handleDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Montagem
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-4 flex overflow-x-auto pb-1 sm:pb-0">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <TaskList 
            type="montagem" 
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="pendente" className="mt-0">
          <TaskList 
            type="montagem" 
            status="pendente"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-0">
          <TaskList 
            type="montagem" 
            status="em_andamento"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="concluida" className="mt-0">
          <TaskList 
            type="montagem" 
            status="concluida"
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            className="mt-4"
          />
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para criar/editar montagem */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Montagem' : 'Criar Nova Montagem'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Edite os detalhes da montagem abaixo' : 'Preencha os detalhes da montagem abaixo'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Título da Montagem*</Label>
              <Input 
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Ex: Montagem de guarda-roupa"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description"
                name="description"
                value={newTask.description || ""}
                onChange={handleInputChange}
                placeholder="Detalhes sobre a montagem"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => handleSelectChange("priority", value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newTask.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input 
                id="clientName"
                name="clientName"
                value={newTask.clientName || ""}
                onChange={handleInputChange}
                placeholder="Nome completo do cliente"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="clientPhone">Telefone do Cliente</Label>
                <Input 
                  id="clientPhone"
                  name="clientPhone"
                  value={newTask.clientPhone || ""}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="clientAddress">Endereço do Cliente</Label>
              <Input 
                id="clientAddress"
                name="clientAddress"
                value={newTask.clientAddress || ""}
                onChange={handleInputChange}
                placeholder="Endereço completo para montagem"
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => handleDialogOpen(false)}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateOrUpdateTask}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Montagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para detalhes da tarefa */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Detalhes da montagem
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Descrição</h4>
                <p className="text-sm text-muted-foreground">{selectedTask.description || "Sem descrição"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm">Status</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedTask.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Prioridade</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedTask.priority}
                  </p>
                </div>
              </div>
              
              {selectedTask.clientName && (
                <div>
                  <h4 className="font-semibold text-sm">Cliente</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.clientName}</p>
                </div>
              )}
              
              {selectedTask.clientPhone && (
                <div>
                  <h4 className="font-semibold text-sm">Telefone</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.clientPhone}</p>
                </div>
              )}
              
              {selectedTask.clientAddress && (
                <div>
                  <h4 className="font-semibold text-sm">Endereço</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.clientAddress}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              onClick={() => {
                setIsTaskDetailsOpen(false);
                if (selectedTask) handleEditTask(selectedTask);
              }}
              variant="outline"
            >
              Editar
            </Button>
            <Button variant="outline" onClick={() => setIsTaskDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
