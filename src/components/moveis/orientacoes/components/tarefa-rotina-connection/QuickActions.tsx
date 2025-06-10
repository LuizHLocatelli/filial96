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
        className="gap-2 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-600"
      >
        <ArrowLeft className="h-3 w-3" />
        Ver Rotina
      </Button>
    </div>
  );
}
