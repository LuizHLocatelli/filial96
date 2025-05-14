
import { CalendarIcon, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CardMetaInfoProps {
  dueDate?: string;
  dueTime?: string; // Add dueTime prop
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
  textColor?: string;
}

export function CardMetaInfo({ dueDate, dueTime, assignee, textColor = "inherit" }: CardMetaInfoProps) {
  // Only render if we have at least one piece of meta info
  if (!dueDate && !assignee) return null;
  
  return (
    <div className="flex flex-wrap items-center mt-2 gap-3" style={{ color: textColor }}>
      {dueDate && (
        <div className="flex items-center gap-1 text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>
            {format(new Date(dueDate), "dd/MM/yyyy", { locale: ptBR })}
            {dueTime && (
              <>
                {" "}
                <Clock className="h-3 w-3 inline-block mx-0.5" />
                {dueTime}
              </>
            )}
          </span>
        </div>
      )}
      
      {assignee && (
        <div className="flex items-center gap-1">
          <Avatar className="h-5 w-5">
            <AvatarImage src={assignee.avatar_url || ""} alt={assignee.name} />
            <AvatarFallback className="text-[10px]">
              {assignee.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">{assignee.name}</span>
        </div>
      )}
    </div>
  );
}
