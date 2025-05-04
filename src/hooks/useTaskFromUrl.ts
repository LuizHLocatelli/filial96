
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskType, TaskStatus } from "@/types";
import { validateTaskType, validateTaskStatus, validatePriority } from "@/utils/typeValidation";

export function useTaskFromUrl(
  setSelectedTask: (task: Task) => void,
  setIsTaskDetailsOpen: (isOpen: boolean) => void,
  setIsEditMode: (isEditMode: boolean) => void,
  setIsEntregaDialogOpen: (isOpen: boolean) => void,
  setIsRetiradaDialogOpen: (isOpen: boolean) => void
) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const taskIdFromUrl = queryParams.get("taskId");
    const action = queryParams.get("action");
    
    if (!taskIdFromUrl) return;
    
    setIsLoading(true);
    // Buscar a tarefa pelo ID
    const fetchTask = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskIdFromUrl)
          .single();
          
        if (error) {
          console.error("Erro ao buscar tarefa:", error);
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Validate task type before assignment
          const taskType: TaskType = validateTaskType(data.type);
          
          // Validate task status before assignment
          const taskStatus: TaskStatus = validateTaskStatus(data.status);
          
          // Validate priority before assignment
          const priority: 'baixa' | 'media' | 'alta' = validatePriority(data.priority);
          
          // Transformar os dados para o formato da Task
          const task: Task = {
            id: data.id,
            type: taskType,
            title: data.title,
            description: data.description || "",
            status: taskStatus,
            assignedTo: data.assigned_to,
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            dueDate: data.due_date,
            completedAt: data.completed_at,
            priority: priority,
            clientName: data.client_name,
            clientPhone: data.client_phone,
            clientAddress: data.client_address,
            clientCpf: data.client_cpf,
            notes: data.notes,
            products: data.notes, // Mapeando notes como products
            purchaseDate: data.purchase_date,
            expectedArrivalDate: data.expected_arrival_date,
            expectedDeliveryDate: data.expected_delivery_date,
            invoiceNumber: data.invoice_number,
          };
          
          setSelectedTask(task);
          
          // Abrir o diálogo apropriado com base no parâmetro de ação
          if (action === "view") {
            setIsTaskDetailsOpen(true);
          } else if (action === "edit") {
            setIsEditMode(true);
            if (task.type === 'entrega') {
              setIsEntregaDialogOpen(true);
            } else if (task.type === 'retirada') {
              setIsRetiradaDialogOpen(true);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar tarefa:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTask();
  }, [location.search]);

  return { isLoading, error };
}
