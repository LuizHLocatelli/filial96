
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TarefaForm } from "@/components/moveis/orientacoes/components/TarefaForm";
import { UseFormReturn } from "react-hook-form";
import { TarefaFormValues } from '../hooks/useTarefasOperations';

interface AddTarefaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TarefaFormValues>;
  onSubmit: (data: TarefaFormValues) => Promise<void>;
  orientacoes: Array<{ id: string; titulo: string }>;
  rotinas: Array<{ id: string; nome: string }>;
}

export function AddTarefaDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  orientacoes,
  rotinas,
}: AddTarefaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <TarefaForm
          form={form}
          orientacoes={orientacoes}
          rotinas={rotinas}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
