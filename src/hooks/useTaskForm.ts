
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/activityLogger";
import { Task, TaskStatus } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema, TaskFormValues } from "@/components/tasks/form/TaskFormSchema";

interface UseTaskFormProps {
  taskId?: string;
  initialData?: Partial<Task>;
  isEditMode?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useTaskForm({
  taskId,
  initialData,
  isEditMode = false,
  onSuccess,
  onCancel,
}: UseTaskFormProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(taskId);

  // Create form with React Hook Form + Zod
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      invoiceNumber: "",
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
      console.log("Setting initial data for form:", initialData);
      
      form.reset({
        invoiceNumber: initialData.invoiceNumber || "",
        observation: initialData.description || "", // Using description as observation
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
  }, [initialData, form]);

  // Update currentTaskId when taskId prop changes
  useEffect(() => {
    if (taskId) {
      setCurrentTaskId(taskId);
    }
  }, [taskId]);

  const resetForm = () => {
    form.reset({
      invoiceNumber: "",
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

  const handleSubmit = async (data: TaskFormValues) => {
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
    console.log("Form data:", data);

    try {
      // Generate a default title based on the invoice number
      const generatedTitle = `${initialData?.type === 'entrega' ? 'Entrega' : 'Retirada'} - NF ${data.invoiceNumber}`;
      
      // Make sure status is one of the valid enum values
      const validStatus = ["pendente", "em_andamento", "concluida", "cancelada", "aguardando_cliente"].includes(data.status) 
        ? data.status 
        : "pendente";
        
      // Make sure priority is one of the valid enum values
      const validPriority = ["baixa", "media", "alta"].includes(data.priority)
        ? data.priority
        : "media";
      
      // Prepare task data with all valid database fields
      const taskData = {
        invoice_number: data.invoiceNumber,
        title: generatedTitle, // Use generated title
        description: data.observation || "", 
        status: validStatus,
        priority: validPriority,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        client_address: data.clientAddress,
        client_cpf: data.clientCpf || null,
        notes: data.products || null,
        purchase_date: data.purchaseDate?.toISOString() || null,
        expected_arrival_date: data.expectedArrivalDate?.toISOString() || null,
        expected_delivery_date: data.expectedDeliveryDate?.toISOString() || null,
        type: initialData?.type || "entrega",
        updated_at: new Date().toISOString(),
      };
      
      // Convert string values to proper Task type values
      const taskStatus = validStatus as TaskStatus;
      const taskPriority = validPriority as "baixa" | "media" | "alta";
      
      let taskForActivity: Task = {
        id: currentTaskId || "",
        invoiceNumber: data.invoiceNumber,
        title: generatedTitle, // Use generated title
        description: data.observation || "", 
        status: taskStatus,
        priority: taskPriority,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        clientCpf: data.clientCpf || "",
        products: data.products || "",
        purchaseDate: data.purchaseDate?.toISOString() || "",
        expectedArrivalDate: data.expectedArrivalDate?.toISOString() || "",
        expectedDeliveryDate: data.expectedDeliveryDate?.toISOString() || "",
        type: initialData?.type || "entrega",
        createdBy: user.id,
        updatedAt: new Date().toISOString(),
        createdAt: initialData?.createdAt || new Date().toISOString(),
        assignedTo: initialData?.assignedTo || null,
      };

      if (isEditMode && currentTaskId) {
        console.log("Updating existing task with ID:", currentTaskId);
        console.log("Task data to update:", taskData);
        
        // When in edit mode, handle as a delete + insert to ensure old task is completely removed
        if (initialData && initialData.id) {
          console.log("Deleting old task before creating new version");
          // Delete the old task
          const { error: deleteError } = await supabase
            .from("tasks")
            .delete()
            .eq("id", initialData.id);

          if (deleteError) {
            throw new Error(`Erro ao excluir tarefa antiga: ${deleteError.message}`);
          }
          
          // Create a new task with the updated data
          const { data: insertData, error: insertError } = await supabase
            .from("tasks")
            .insert({
              ...taskData,
              created_by: user.id,
              // Use original creation date when possible
              created_at: initialData?.createdAt || new Date().toISOString(),
            })
            .select("id")
            .single();

          if (insertError) {
            throw new Error(`Erro ao criar tarefa atualizada: ${insertError.message}`);
          }

          // Update task ID for activity logging
          taskForActivity.id = insertData.id;
        } else {
          // Fallback to standard update if something is wrong with initialData
          const { error: updateError } = await supabase
            .from("tasks")
            .update(taskData)
            .eq("id", currentTaskId);

          if (updateError) {
            throw new Error(`Erro ao atualizar tarefa: ${updateError.message}`);
          }
        }
        
        // Log activity for task update
        await logActivity({
          action: "atualizou",
          task: taskForActivity,
          userId: user.id,
          userName: profile?.name
        });

        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        console.log("Creating new task");
        console.log("Task data to create:", taskData);
        
        // Criar nova tarefa
        const { data: insertData, error: taskError } = await supabase
          .from("tasks")
          .insert({
            ...taskData,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (taskError) {
          throw new Error(`Erro ao criar tarefa: ${taskError.message}`);
        }
        
        // Update task ID for activity logging
        taskForActivity.id = insertData.id;
        
        // Log activity for new task
        await logActivity({
          action: "criou",
          task: taskForActivity,
          userId: user.id,
          userName: profile?.name
        });

        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso.",
        });
      }

      // Limpar o formulário e fechar o diálogo
      resetForm();
      
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
