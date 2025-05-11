
import { UseFormReturn } from "react-hook-form";
import { ClienteFormValues } from "../../types";
import { ClienteDateField } from "./ClienteDateField";

interface ClienteDatesFieldsProps {
  form: UseFormReturn<ClienteFormValues>;
}

export function ClienteDatesFields({ form }: ClienteDatesFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ClienteDateField 
        form={form} 
        name="diaContato" 
        label="Dia do Contato" 
      />
      <ClienteDateField 
        form={form} 
        name="diaPagamento" 
        label="Dia do Pagamento" 
      />
    </div>
  );
}
