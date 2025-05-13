
import { Badge } from "@/components/ui/badge";

const priorityColors: Record<string, string> = {
  baixa: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface PriorityBadgeProps {
  priority: 'baixa' | 'media' | 'alta';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityLabel = 
    priority === 'baixa' ? 'Baixa' : 
    priority === 'media' ? 'Média' : 
    'Alta';
    
  return (
    <Badge variant="outline" className={`text-xs ${priorityColors[priority]}`}>
      {priorityLabel}
    </Badge>
  );
}
