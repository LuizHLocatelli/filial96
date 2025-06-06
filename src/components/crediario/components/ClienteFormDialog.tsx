
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClienteForm } from "./ClienteForm";
import { Cliente, ClienteFormValues } from "../types";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface ClienteFormDialogProps {
  open: boolean;
  cliente: Cliente | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClienteFormValues) => Promise<void>;
}

export function ClienteFormDialog({ 
  open, 
  cliente, 
  onOpenChange, 
  onSubmit 
}: ClienteFormDialogProps) {
  const { getMobileDialogProps } = useMobileDialog();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("2xl")} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {cliente ? "Editar Cliente" : "Adicionar Cliente"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {cliente 
              ? "Edite as informações do cliente agendado." 
              : "Adicione um novo cliente com agendamento de pagamento ou renegociação."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <ClienteForm 
            cliente={cliente} 
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
