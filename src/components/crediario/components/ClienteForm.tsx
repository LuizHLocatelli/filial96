
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ClienteBasicFields } from "./form-fields/ClienteBasicFields";
import { ClienteDatesFields } from "./form-fields/ClienteDatesFields";
import { ClienteRenegociacaoFields } from "./form-fields/ClienteRenegociacaoFields";
import { ClienteObservacaoField } from "./form-fields/ClienteObservacaoField";
import { ClienteFormValues } from "../types";
import { useClienteForm } from "../hooks/useClienteForm";
import type { Cliente } from "../types";
import { ClienteIndicatorField } from "./form-fields/ClienteIndicatorField";

interface ClienteFormProps {
  cliente: Cliente | null | undefined;
  onSubmit: (data: ClienteFormValues) => Promise<void>;
}

export function ClienteForm({ cliente, onSubmit }: ClienteFormProps) {
  const { form, isSubmitting, tipoAgendamento, handleFormSubmit } = useClienteForm(cliente, onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <ClienteBasicFields />
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ClienteDatesFields />
          <ClienteIndicatorField />
        </div>
        
        {tipoAgendamento === "renegociacao" && (
          <ClienteRenegociacaoFields />
        )}
        
        <ClienteObservacaoField />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : cliente ? "Atualizar Cliente" : "Adicionar Cliente"}
        </Button>
      </form>
    </Form>
  );
}
