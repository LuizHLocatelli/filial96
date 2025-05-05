
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/activityLogger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskType, TaskStatus } from "@/types";
import { CreateTaskFormContent } from "./form/CreateTaskFormContent";
import { TaskAttachments } from "./attachments/TaskAttachments";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: TaskType;
  title: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  taskType,
  title,
}: CreateTaskDialogProps) {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | undefined>();
  const [isTaskCreated, setIsTaskCreated] = useState(false);
  
  const [task, setTask] = useState({
    title: "",
    observation: "",
    status: "pendente",
    priority: "media",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    clientCpf: "",
    purchaseDate: "",
    expectedArrivalDate: "",
    expectedDeliveryDate: "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setTask({
      title: "",
      observation: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      clientCpf: "",
      purchaseDate: "",
      expectedArrivalDate: "",
      expectedDeliveryDate: "",
    });
    setCreatedTaskId(undefined);
    setIsTaskCreated(false);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleCreateTask = async () => {
    if (!task.title) {
      toast({
        title: "Erro",
        description: `Por favor, adicione um título para a ${getTaskTypeName(taskType)}.`,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma tarefa.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Criar a nova tarefa com todos os campos do banco de dados
      const taskId = uuidv4();
      
      const { error: taskError } = await supabase
        .from("tasks")
        .insert({
          id: taskId,
          type: taskType,
          title: task.title,
          description: task.observation, // Note: DB field is 'description'
          status: task.status,
          priority: task.priority,
          client_name: task.clientName,
          client_phone: task.clientPhone,
          client_address: task.clientAddress,
          client_cpf: task.clientCpf,
          purchase_date: task.purchaseDate ? new Date(task.purchaseDate).toISOString() : null,
          expected_arrival_date: task.expectedArrivalDate ? new Date(task.expectedArrivalDate).toISOString() : null,
          expected_delivery_date: task.expectedDeliveryDate ? new Date(task.expectedDeliveryDate).toISOString() : null,
          created_by: user.id,
        });
      
      if (taskError) {
        throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
      }
      
      // Log activity for the new task
      const newTask = {
        id: taskId,
        type: taskType,
        title: task.title,
        description: task.observation,
        status: task.status as TaskStatus,
        priority: task.priority as "baixa" | "media" | "alta",
        clientName: task.clientName,
        clientPhone: task.clientPhone,
        clientAddress: task.clientAddress,
        clientCpf: task.clientCpf,
        purchaseDate: task.purchaseDate,
        expectedArrivalDate: task.expectedArrivalDate,
        expectedDeliveryDate: task.expectedDeliveryDate,
        createdBy: user.id,
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log("Registrando atividade após criar tarefa");
      await logActivity({
        action: "criou",
        task: newTask,
        userId: user.id,
        userName: profile?.name
      });
      
      toast({
        title: "Tarefa criada",
        description: `A nova ${getTaskTypeName(taskType)} foi criada com sucesso.`,
      });
      
      // Salvar o ID da tarefa criada para exibir o componente de anexos
      setCreatedTaskId(taskId);
      setIsTaskCreated(true);
      
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get a friendly name for the task type
  function getTaskTypeName(type: TaskType): string {
    const typeNames: Record<TaskType, string> = {
      entrega: "entrega",
      retirada: "retirada",
      montagem: "montagem",
      garantia: "garantia",
      organizacao: "organização",
      cobranca: "cobrança"
    };
    return typeNames[type] || "tarefa";
  }
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova {title}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da {getTaskTypeName(taskType)} abaixo
          </DialogDescription>
        </DialogHeader>
        
        {!isTaskCreated ? (
          <>
            <CreateTaskFormContent 
              task={task} 
              handleInputChange={handleInputChange} 
              handleSelectChange={handleSelectChange}
              taskType={taskType}
            />
            
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
                onClick={handleCreateTask}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Tarefa criada com sucesso!</h3>
              <p className="text-sm text-muted-foreground">Agora você pode adicionar anexos à tarefa.</p>
            </div>
            
            <TaskAttachments taskId={createdTaskId} />
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button 
                onClick={() => handleDialogOpen(false)}
                className="w-full"
              >
                Concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
