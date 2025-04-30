
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskType } from "@/types";
import { CreateTaskFormContent } from "./form/CreateTaskFormContent";

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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [task, setTask] = useState({
    title: "",
    observation: "",
    status: "pendente",
    priority: "media",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
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
    });
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
      // Criar a nova tarefa
      const { error: taskError } = await supabase
        .from("tasks")
        .insert({
          id: uuidv4(),
          type: taskType,
          title: task.title,
          description: task.observation, // Note: DB field is 'description'
          status: task.status,
          priority: task.priority,
          client_name: task.clientName,
          client_phone: task.clientPhone,
          client_address: task.clientAddress,
          created_by: user.id,
        });
      
      if (taskError) {
        throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
      }
      
      toast({
        title: "Tarefa criada",
        description: `A nova ${getTaskTypeName(taskType)} foi criada com sucesso.`,
      });
      
      // Limpar o formulário e fechar o diálogo
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
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
      </DialogContent>
    </Dialog>
  );
}
