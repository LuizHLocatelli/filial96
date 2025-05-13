
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CardMetaInfoProps {
  dueDate?: string | null;
  assignee?: { id: string; name: string } | null;
  textColor?: string;
}

export function CardMetaInfo({ 
  dueDate, 
  assignee,
  textColor
}: CardMetaInfoProps) {
  // Formato de estilos condicionais para o texto
  const textStyle = textColor ? { color: textColor, opacity: 0.8 } : undefined;
  
  return (
    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
      {dueDate && (
        <div className="flex items-center gap-1" style={textStyle}>
          <Calendar className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(dueDate), { 
            addSuffix: true, 
            locale: ptBR 
          })}</span>
        </div>
      )}
      
      {assignee && (
        <div className="flex items-center gap-1 ml-auto" style={textStyle}>
          <Avatar className="h-4 w-4">
            <AvatarFallback className="text-[10px]" style={textColor ? { color: textColor, backgroundColor: `${textColor}20` } : undefined}>
              {assignee.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{assignee.name}</span>
        </div>
      )}
      
      {!assignee && (
        <div className="flex items-center gap-1 ml-auto" style={textStyle}>
          <User className="h-3 w-3" />
          <span>Não atribuído</span>
        </div>
      )}
    </div>
  );
}
