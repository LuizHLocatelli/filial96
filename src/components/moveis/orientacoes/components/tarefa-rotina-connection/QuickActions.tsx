
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface QuickActionsProps {
  rotinaId: string;
  onViewRotina?: (rotinaId: string) => void;
}

export function QuickActions({ rotinaId, onViewRotina }: QuickActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onViewRotina?.(rotinaId)}
        className="gap-2 text-xs"
      >
        <ArrowLeft className="h-3 w-3" />
        Ver Rotina
      </Button>
    </div>
  );
}
