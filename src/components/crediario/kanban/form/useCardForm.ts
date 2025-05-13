
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormValues } from "./CardFormFields";
import { useState } from "react";
import { TaskCard } from "../types";

export function useCardForm(initialData?: TaskCard) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "media",
      assigneeId: initialData?.assignee_id,
      dueDate: initialData?.due_date ? new Date(initialData.due_date) : undefined,
    },
  });
  
  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      priority: "media",
      assigneeId: undefined,
      dueDate: undefined,
    });
  };
  
  const handleSubmit = (callback: (data: FormValues) => void) => {
    return form.handleSubmit(async (data) => {
      setIsSubmitting(true);
      try {
        await callback(data);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    });
  };
  
  return {
    form,
    resetForm,
    handleSubmit,
    isSubmitting
  };
}
