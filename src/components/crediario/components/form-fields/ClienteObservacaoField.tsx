
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ClienteFormValues } from "../../types";

export interface ClienteObservacaoFieldProps {
  form: UseFormReturn<ClienteFormValues>;
}

export function ClienteObservacaoField({ form }: ClienteObservacaoFieldProps) {
  return (
    <FormField
      control={form.control}
      name="observacao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observação</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
