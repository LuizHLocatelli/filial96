import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClienteForm } from "./ClienteForm";
import { Cliente, ClienteFormValues } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
          <DialogDescription>
            {cliente 
              ? "Edite as informações do cliente agendado." 
              : "Adicione um novo cliente com agendamento de pagamento ou renegociação."
            }
          </DialogDescription>
        </DialogHeader>
        <ClienteForm 
          cliente={cliente} 
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
