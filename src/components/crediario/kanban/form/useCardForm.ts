
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormValues } from "./CardFormFields";

export function useCardForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "media",
    },
  });
  
  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      priority: "media",
    });
  };
  
  return {
    form,
    resetForm
  };
}
