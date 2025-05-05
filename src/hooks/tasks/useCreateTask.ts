
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/activityLogger";
import { TaskType } from "@/types";

interface UseCreateTaskProps {
  taskType: TaskType;
  onSuccess?: (taskId: string) => void;
}

export interface CreateTaskFormState {
  title: string;
  observation: string;
  status: string;
  priority: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientCpf: string;
  purchaseDate: string;
  expectedArrivalDate: string;
  expectedDeliveryDate: string;
}

export const initialTaskState: CreateTaskFormState = {
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
};

export function useCreateTask({ taskType, onSuccess }: UseCreateTaskProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<CreateTaskFormState>(initialTaskState);
  const [createdTaskId, setCreatedTaskId] = useState<string | undefined>();
  const [isTaskCreated, setIsTaskCreated] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setTask(initialTaskState);
    setCreatedTaskId(undefined);
    setIsTaskCreated(false);
  };

  // Helper function to get a friendly name for the task type
  const getTaskTypeName = (type: TaskType): string => {
    const typeNames: Record<TaskType, string> = {
      entrega: "entrega",
      retirada: "retirada",
      montagem: "montagem",
      garantia: "garantia",
      organizacao: "organização",
      cobranca: "cobrança"
    };
    return typeNames[type] || "tarefa";
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
        status: task.status as any,
        priority: task.priority as any,
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
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(taskId);
      }
      
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

  return {
    task,
    isSubmitting,
    isTaskCreated,
    createdTaskId,
    handleInputChange,
    handleSelectChange,
    handleCreateTask,
    resetForm,
    getTaskTypeName,
  };
}
