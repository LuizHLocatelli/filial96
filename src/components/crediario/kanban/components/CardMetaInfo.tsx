
import { Calendar, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CardMetaInfoProps {
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
}

export function CardMetaInfo({ dueDate, assignee }: CardMetaInfoProps) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      {dueDate && (
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {formatDistanceToNow(new Date(dueDate), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </span>
        </div>
      )}
      
      {assignee && (
        <div className="flex items-center">
          <Circle className="h-3 w-3 mr-1 fill-current" />
          <span>{assignee.name}</span>
        </div>
      )}
    </div>
  );
}
