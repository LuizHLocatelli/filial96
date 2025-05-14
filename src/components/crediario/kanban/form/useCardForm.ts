
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { formSchema, FormValues } from "./CardFormFields";
import { TaskCard } from "../types";

interface UseCardFormProps {
  initialData?: Partial<TaskCard>;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}

export function useCardForm({ initialData, onSubmit, onCancel }: UseCardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "media",
      assigneeId: initialData?.assignee_id || undefined,
      dueDate: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      dueTime: initialData?.due_time || "",
      backgroundColor: initialData?.background_color || "#FFFFFF", // Default to white
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    form.reset();
    onCancel();
  };
  
  return {
    form,
    isSubmitting,
    handleSubmit,
    handleCancel
  };
}
