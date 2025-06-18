import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionHeaderProps {
  origem: string;
}

export function ConnectionHeader({ origem }: ConnectionHeaderProps) {
  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case 'rotina': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20';
      case 'orientacao': return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/10 dark:text-primary dark:border-primary/30';
      case 'manual': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link2 className="h-4 w-4 text-green-700 dark:text-green-300" />
      <span className="text-sm font-medium text-green-900 dark:text-green-200">
        Tarefa conectada à rotina
      </span>
      <Badge className={getOrigemColor(origem)}>
        {origem}
      </Badge>
    </div>
  );
}
