
import { Button } from "@/components/ui/button";
import { Cliente } from "@/components/crediario/types";
import { Phone, MessageSquare, Edit, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  cliente: Cliente;
  onContactHistory: (cliente: Cliente) => void;
  onMessageTemplate: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export function ActionButtons({
  cliente,
  onContactHistory,
  onMessageTemplate,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onContactHistory(cliente)}
        className="gap-1"
      >
        <Phone className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onMessageTemplate(cliente)}
        className="gap-1"
      >
        <MessageSquare className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(cliente)}
        className="gap-1"
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(cliente.id)}
        className="gap-1 text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
