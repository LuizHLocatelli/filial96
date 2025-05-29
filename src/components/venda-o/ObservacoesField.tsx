import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface ObservacoesFieldProps {
  control: Control<any>;
}

export function ObservacoesField({ control }: ObservacoesFieldProps) {
  return (
    <FormField
      control={control}
      name="observacoes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs sm:text-sm flex items-center gap-2">
            <span>Observações</span>
            <span className="text-xs text-muted-foreground">(opcional)</span>
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Informações adicionais sobre a venda..." 
              className="text-xs sm:text-sm resize-none bg-muted/40"
              rows={3}
              {...field} 
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
