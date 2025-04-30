
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { taskFormSchema, TaskFormValues } from "./form/TaskFormSchema";
import { TaskFormContent } from "./form/TaskFormContent";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  taskId,
  initialData,
  isEditMode = false,
  onSuccess,
}: TaskFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(taskId);

  // Create form with React Hook Form + Zod
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      observation: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      products: "",
      clientCpf: "",
    }
  });

  // Set initial data when the component mounts or when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        observation: initialData.observation || "",
        status: initialData.status || "pendente",
        priority: initialData.priority || "media",
        clientName: initialData.clientName || "",
        clientPhone: initialData.clientPhone || "",
        clientAddress: initialData.clientAddress || "",
        products: initialData.products || "",
        purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
        expectedArrivalDate: initialData.expectedArrivalDate ? new Date(initialData.expectedArrivalDate) : undefined,
        expectedDeliveryDate: initialData.expectedDeliveryDate ? new Date(initialData.expectedDeliveryDate) : undefined,
        clientCpf: initialData.clientCpf || "",
      });
    }
  }, [initialData, open, form]);

  // Update currentTaskId when taskId prop changes
  useEffect(() => {
    setCurrentTaskId(taskId);
  }, [taskId, isEditMode]);

  const resetForm = () => {
    form.reset({
      title: "",
      observation: "",
      status: "pendente",
      priority: "media",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      products: "",
      purchaseDate: undefined,
      expectedArrivalDate: undefined,
      expectedDeliveryDate: undefined,
      clientCpf: "",
    });
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleSaveTask = async (data: TaskFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma tarefa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Saving task with ID:", currentTaskId, "isEditMode:", isEditMode);

    try {
      // Prepare task data, removing fields that don't exist in the database
      const taskData = {
        title: data.title,
        description: data.observation || "", // Using description field in DB instead of observation
        status: data.status,
        priority: data.priority,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        client_address: data.clientAddress,
        products: data.products,
        purchase_date: data.purchaseDate?.toISOString(),
        expected_arrival_date: data.expectedArrivalDate?.toISOString(),
        expected_delivery_date: data.expectedDeliveryDate?.toISOString(),
        type: initialData?.type || "entrega",
        updated_at: new Date().toISOString(),
        // Removing client_cpf as it doesn't exist in the database
      };

      if (isEditMode && currentTaskId) {
        // Atualizar tarefa existente
        const { error: updateError } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", currentTaskId);

        if (updateError) {
          throw new Error(`Erro ao atualizar tarefa: ${updateError.message}`);
        }

        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        // Criar nova tarefa - certifique-se de que temos um ID válido
        const taskInsertId = currentTaskId || undefined;
        
        const { error: taskError } = await supabase
          .from("tasks")
          .insert({
            id: taskInsertId,
            ...taskData,
            created_by: user.id,
          });

        if (taskError) {
          throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
        }

        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso.",
        });
      }

      // Limpar o formulário e fechar o diálogo
      resetForm();
      onOpenChange(false);
      
      // Callback para comunicar sucesso ao componente pai
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Edite os detalhes da tarefa abaixo' : 'Preencha os detalhes da tarefa abaixo'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveTask)} className="space-y-4">
            <TaskFormContent control={form.control} />
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleDialogOpen(false)}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Salvar Tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
