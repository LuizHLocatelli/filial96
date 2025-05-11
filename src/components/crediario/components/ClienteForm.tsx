
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Cliente, ClienteFormValues } from "../types";
import { ClienteBasicFields } from "./form-fields/ClienteBasicFields";
import { ClienteRenegociacaoFields } from "./form-fields/ClienteRenegociacaoFields";
import { ClienteDatesFields } from "./form-fields/ClienteDatesFields";
import { ClienteObservacaoField } from "./form-fields/ClienteObservacaoField";
import { useClienteForm } from "../hooks/useClienteForm";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (data: ClienteFormValues) => void;
  onCancel: () => void;
}

export function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  // Wrap the onSubmit function to return a Promise
  const handleSubmit = async (data: ClienteFormValues): Promise<void> => {
    onSubmit(data);
    return Promise.resolve();
  };

  const { form, isSubmitting, tipoAgendamento, handleFormSubmit } = useClienteForm(cliente, handleSubmit);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <ClienteBasicFields form={form} />
        <ClienteRenegociacaoFields form={form} visible={tipoAgendamento === "renegociacao"} />
        <ClienteDatesFields form={form} />
        <ClienteObservacaoField form={form} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? "Salvando..." 
              : (cliente ? "Salvar Alterações" : "Adicionar Cliente")
            }
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
