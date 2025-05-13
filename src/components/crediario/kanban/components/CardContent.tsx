
import { PriorityBadge } from "./PriorityBadge";

interface CardContentProps {
  title: string;
  description?: string | null;
  priority: 'baixa' | 'media' | 'alta';
  textColor?: string;
}

export function CardContent({ 
  title, 
  description,
  priority,
  textColor
}: CardContentProps) {
  return (
    <div>
      <div className="flex justify-between items-start gap-2">
        <h3 
          className="font-medium truncate mb-1"
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </h3>
        <PriorityBadge priority={priority} />
      </div>
      
      {description && (
        <p 
          className="text-sm line-clamp-2"
          style={textColor ? { color: textColor, opacity: 0.9 } : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
}
