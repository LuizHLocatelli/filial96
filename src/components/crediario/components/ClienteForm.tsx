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
  onCancel?: () => void;
}

export function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const { form, isSubmitting, tipoAgendamento, handleFormSubmit } = useClienteForm(cliente, onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <ClienteBasicFields form={form} />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ClienteDatesFields form={form} />
          <ClienteIndicatorField />
        </div>
        
        {tipoAgendamento === "renegociacao" && (
          <ClienteRenegociacaoFields form={form} visible={tipoAgendamento === "renegociacao"} />
        )}
        
        <ClienteObservacaoField form={form} />
        
        <div className="flex justify-end gap-3 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="px-6">
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            {isSubmitting ? "Salvando..." : cliente ? "Atualizar Cliente" : "Adicionar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
