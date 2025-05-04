
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "@/types";
import { validateTaskStatus, validateTaskPriority, generateTaskTitle } from "./useTaskValidation";
import { logActivity } from "@/utils/activityLogger";

interface TaskData {
  invoiceNumber: string;
  observation: string;
  status: string;
  priority: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientCpf?: string;
  products?: string;
  purchaseDate?: Date;
  expectedArrivalDate?: Date;
  expectedDeliveryDate?: Date;
}

interface SaveTaskOptions {
  taskId?: string;
  isEditMode: boolean;
  initialData?: Partial<Task>;
  userId: string;
  userName?: string;
}

export async function saveTask(data: TaskData, options: SaveTaskOptions): Promise<{ success: boolean; error?: any }> {
  const { taskId, isEditMode, initialData, userId, userName } = options;
  
  try {
    // Generate a default title based on the invoice number
    const generatedTitle = generateTaskTitle(initialData?.type, data.invoiceNumber);
    
    // Make sure status is one of the valid enum values
    const validStatus = validateTaskStatus(data.status);
    
    // Make sure priority is one of the valid enum values
    const validPriority = validateTaskPriority(data.priority);
    
    // Prepare task data with all valid database fields
    const taskData = {
      invoice_number: data.invoiceNumber,
      title: generatedTitle,
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
      id: taskId || "",
      invoiceNumber: data.invoiceNumber,
      title: generatedTitle,
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
      createdBy: userId,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      assignedTo: initialData?.assignedTo || null,
    };

    if (isEditMode && initialData && initialData.id) {
      console.log("Updating existing task with ID:", initialData.id);
      
      // First, delete the old task to ensure it's completely removed
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", initialData.id);
      
      if (deleteError) {
        console.error("Error deleting old task:", deleteError);
        throw new Error(`Erro ao excluir tarefa antiga: ${deleteError.message}`);
      }
      
      console.log("Old task deleted successfully, creating new task");
      
      // Create a new task with the updated data
      const { data: insertData, error: insertError } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          created_by: userId,
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
      
      // Log activity for task update
      await logActivity({
        action: "atualizou",
        task: taskForActivity,
        userId: userId,
        userName: userName
      });
      
      return { success: true };
    } else {
      console.log("Creating new task");
      
      // Criar nova tarefa
      const { data: insertData, error: taskError } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          created_by: userId,
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
        userId: userId,
        userName: userName
      });

      return { success: true };
    }
  } catch (error) {
    console.error("Erro ao salvar tarefa:", error);
    return { success: false, error };
  }
}
