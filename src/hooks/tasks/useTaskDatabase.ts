
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/activityLogger";
import { TaskFormValues } from "@/components/tasks/form/TaskFormSchema";
import { Task } from "@/types";

interface SaveTaskOptions {
  taskId?: string;
  isEditMode: boolean;
  initialData?: Partial<Task>;
  userId: string;
  userName?: string;
}

interface SaveTaskResult {
  success: boolean;
  taskId?: string;
  error?: any;
}

export async function saveTask(
  data: TaskFormValues,
  options: SaveTaskOptions
): Promise<SaveTaskResult> {
  try {
    const { isEditMode, userId, userName } = options;
    let taskId = options.taskId;

    // Preparar os dados para o banco
    const taskData = {
      type: data.type,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      client_name: data.clientName,
      client_phone: data.clientPhone,
      client_address: data.clientAddress,
      client_cpf: data.clientCpf,
      purchase_date: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
      expected_arrival_date: data.expectedArrivalDate
        ? new Date(data.expectedArrivalDate).toISOString()
        : null,
      expected_delivery_date: data.expectedDeliveryDate
        ? new Date(data.expectedDeliveryDate).toISOString()
        : null,
      invoice_number: data.invoiceNumber,
    };

    // Criar ou atualizar a tarefa
    if (!isEditMode) {
      // Criar uma nova tarefa
      taskId = uuidv4();

      const { error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          id: taskId,
          created_by: userId,
        });

      if (error) throw error;

      // Log activity for the new task
      await logActivity({
        action: "criou",
        task: {
          ...data,
          id: taskId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        userId,
        userName,
      });
    } else {
      // Atualizar tarefa existente
      if (!taskId) throw new Error("Task ID is required for update");

      const { error } = await supabase
        .from("tasks")
        .update({
          ...taskData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      // Log activity for the updated task
      await logActivity({
        action: "atualizou",
        task: {
          ...data,
          id: taskId,
          updatedAt: new Date().toISOString(),
        },
        userId,
        userName,
      });
    }

    return {
      success: true,
      taskId: taskId
    };
  } catch (error) {
    console.error("Error saving task:", error);
    return {
      success: false,
      error,
    };
  }
}
