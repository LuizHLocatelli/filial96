
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ClienteFormValues } from "../../types";

interface ClienteRenegociacaoFieldsProps {
  form: UseFormReturn<ClienteFormValues>;
  visible: boolean;
}

export function ClienteRenegociacaoFields({ form, visible }: ClienteRenegociacaoFieldsProps) {
  if (!visible) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contratosNegociados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contratos Negociados</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="valorEntrada"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor da Entrada</FormLabel>
            <FormControl>
              <Input {...field} placeholder="R$ 0,00" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="qtdParcelas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantidade de Parcelas</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="valorCadaParcela"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor de cada Parcela</FormLabel>
            <FormControl>
              <Input {...field} placeholder="R$ 0,00" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
