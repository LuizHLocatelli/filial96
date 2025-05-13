
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./types";
import { CardDetails } from "./CardDetails";
import { useState } from "react";
import { useUsers } from "./useUsers";

const priorityColors: Record<string, string> = {
  baixa: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function KanbanCard({ card }: { card: TaskCard }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { usersData } = useUsers();
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      columnId: card.column_id,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setDetailsOpen(true)}
        className="bg-card p-3 rounded-md border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        {...attributes}
        {...listeners}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium line-clamp-2">{card.title}</h4>
            <Badge variant="outline" className={`text-xs ${priorityColors[card.priority]}`}>
              {card.priority === 'baixa' ? 'Baixa' : card.priority === 'media' ? 'Média' : 'Alta'}
            </Badge>
          </div>
          
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {card.due_date && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(card.due_date), { 
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
        </div>
      </div>
      
      <CardDetails 
        card={card} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
      />
    </>
  );
}
