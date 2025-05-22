
import { useState } from "react";
import { TaskCard } from "./types";
import { useDraggable } from "@dnd-kit/core";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CardDetails } from "./CardDetails";
import { cn } from "@/lib/utils";
import { useUsers } from "./useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Calendar, Clock } from "lucide-react";

interface KanbanCardProps {
  card: TaskCard;
  onDelete: () => void;
  onUpdate: (updates: Partial<TaskCard>) => void;
}

export function KanbanCard({ card, onDelete, onUpdate }: KanbanCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { usersData } = useUsers();
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card,
  });
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;
  
  // Format due date display
  const formatDueDate = () => {
    if (!card.due_date) return null;
    
    const dueDate = new Date(card.due_date);
    
    if (isToday(dueDate)) {
      return "Hoje";
    } else if (isTomorrow(dueDate)) {
      return "Amanhã";
    } else {
      return format(dueDate, "dd/MM/yyyy", { locale: ptBR });
    }
  };
  
  // Calculate if task is overdue
  const isOverdue = () => {
    if (!card.due_date) return false;
    return new Date(card.due_date) < new Date() && card.column_id !== "column-3"; // Assuming column-3 is the "Done" column
  };
  
  // Define priority styling
  const getPriorityStyle = () => {
    switch (card.priority) {
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "media":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "";
    }
  };
  
  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          opacity: isDragging ? 0.5 : 1,
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          background: card.background_color || "white",
        }}
        onClick={() => setDetailsOpen(true)}
        className={cn(
          "p-3 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-all border",
          isDragging ? "ring-2 ring-primary" : "",
          isOverdue() ? "border-red-300 dark:border-red-500" : "border-gray-200 dark:border-gray-700"
        )}
      >
        <div className="space-y-2">
          {/* Header with priority */}
          <div className="flex items-center justify-between gap-1">
            <Badge variant="outline" className={getPriorityStyle()}>
              {card.priority === "baixa" ? "Baixa" : card.priority === "media" ? "Média" : "Alta"}
            </Badge>
            
            {isOverdue() && (
              <div className="flex items-center text-red-500 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}
          </div>
          
          {/* Title and description */}
          <div>
            <h3 className="font-medium text-sm line-clamp-2">{card.title}</h3>
            {card.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {card.description}
              </p>
            )}
          </div>
          
          {/* Due date and time */}
          {(card.due_date || card.due_time) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {card.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className={isOverdue() ? "text-red-500 dark:text-red-400" : ""}>
                    {formatDueDate()}
                  </span>
                </div>
              )}
              
              {card.due_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{card.due_time}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Assignee */}
          {assignee && (
            <div className="flex justify-end mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar_url || ""} alt={assignee.name} />
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {assignee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
      
      <CardDetails
        card={card}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </>
  );
}
