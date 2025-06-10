
import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionHeaderProps {
  origem: string;
}

export function ConnectionHeader({ origem }: ConnectionHeaderProps) {
  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case 'rotina': return 'bg-green-100 text-green-800 border-green-200';
      case 'orientacao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manual': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link2 className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-800">
        Tarefa conectada à rotina
      </span>
      <Badge className={getOrigemColor(origem)}>
        {origem}
      </Badge>
    </div>
  );
}
