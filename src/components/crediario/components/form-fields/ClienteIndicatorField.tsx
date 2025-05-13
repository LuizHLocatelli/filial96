
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indicatorOptions } from "../../types";
import { useFormContext } from "react-hook-form";
import type { ClienteFormValues } from "../../types";

export function ClienteIndicatorField() {
  const form = useFormContext<ClienteFormValues>();

  return (
    <FormField
      control={form.control}
      name="indicator"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Indicador</FormLabel>
          <FormControl>
            <Select 
              value={field.value || "none"}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um indicador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {indicatorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
