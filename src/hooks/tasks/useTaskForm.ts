
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { Task } from "@/types";
import { TaskFormValues } from "@/components/tasks/form/TaskFormSchema";
import { useTaskFormState } from "../useTaskFormState";
import { saveTask } from "./useTaskDatabase";

interface UseTaskFormProps {
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useTaskForm({
  taskId: propTaskId,
  initialData,
  isEditMode = false,
  onSuccess,
  onCancel,
}: UseTaskFormProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { form, taskId, resetForm } = useTaskFormState(initialData);

  const handleSubmit = async (data: TaskFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma tarefa.",
        variant: "destructive",
      });
      return null;
    }

    setIsSubmitting(true);
    console.log("Saving task with ID:", taskId, "isEditMode:", isEditMode);
    console.log("Form data:", data);

    try {
      const result = await saveTask(data, {
        taskId: taskId || propTaskId,
        isEditMode,
        initialData,
        userId: user.id,
        userName: profile?.name
      });
      
      if (result.success) {
        toast({
          title: isEditMode ? "Tarefa atualizada" : "Tarefa criada",
          description: isEditMode 
            ? "A tarefa foi atualizada com sucesso." 
            : "A nova tarefa foi criada com sucesso.",
        });
        
        // Limpar o formulário
        resetForm();
        
        // Callback para comunicar sucesso ao componente pai
        if (onSuccess) {
          onSuccess();
        }
        
        // Retorna o ID da tarefa criada/atualizada para permitir anexos
        return { taskId: result.taskId };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return {
    form,
    isSubmitting,
    resetForm,
    handleSubmit,
    handleCancel
  };
}
