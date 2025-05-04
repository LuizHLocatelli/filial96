
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task } from "@/types";
import { taskFormSchema, TaskFormValues } from "@/components/tasks/form/TaskFormSchema";

export function useTaskFormState(initialData?: Partial<Task>) {
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  
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
  
  // Set taskId when props.taskId changes
  useEffect(() => {
    if (initialData && initialData.id) {
      setTaskId(initialData.id);
    }
  }, [initialData]);

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
  
  return {
    form,
    taskId,
    setTaskId,
    resetForm
  };
}
