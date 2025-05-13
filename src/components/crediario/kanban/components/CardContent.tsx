
import { PriorityBadge } from "./PriorityBadge";

interface CardContentProps {
  title: string;
  description?: string;
  priority: 'baixa' | 'media' | 'alta';
}

export function CardContent({ title, description, priority }: CardContentProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium line-clamp-2">{title}</h4>
        <PriorityBadge priority={priority} />
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
    </div>
  );
}
