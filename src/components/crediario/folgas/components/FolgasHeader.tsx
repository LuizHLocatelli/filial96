
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolgasHeaderProps {
  onAddFolga: () => void;
}

export function FolgasHeader({ onAddFolga }: FolgasHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Folgas</h2>
        <p className="text-sm text-muted-foreground">
          Gerenciamento de folgas dos crediaristas
        </p>
      </div>
      <Button onClick={onAddFolga}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Adicionar Folga
      </Button>
    </div>
  );
}
