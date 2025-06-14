
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone } from "lucide-react";

interface MassActionsProps {
  selectedCount: number;
  onWhatsApp: () => void;
  onCallList: () => void;
}

export function MassActions({ selectedCount, onWhatsApp, onCallList }: MassActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg dark:bg-primary/10 dark:border-primary/20">
      <span className="text-sm font-medium">
        {selectedCount} cliente(s) selecionado(s)
      </span>
      <Button variant="outline" size="sm" className="gap-1" onClick={onWhatsApp}>
        <MessageSquare className="h-3 w-3" />
        WhatsApp em Massa
      </Button>
      <Button variant="outline" size="sm" className="gap-1" onClick={onCallList}>
        <Phone className="h-3 w-3" />
        Lista de Ligações
      </Button>
    </div>
  );
}
