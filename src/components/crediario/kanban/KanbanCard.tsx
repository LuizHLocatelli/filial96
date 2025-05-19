
import { useState } from "react";
import { TaskCard } from "./types";
import { CardDetails } from "./CardDetails";
import { useUsers } from "./useUsers";
import { CardContent } from "./components/CardContent";
import { CardMetaInfo } from "./components/CardMetaInfo";
import { CardContainer } from "./card/CardContainer";
import { CardTimer } from "./card/CardTimer";

interface KanbanCardProps {
  card: TaskCard;
  onDelete?: () => void;
  onUpdate?: (cardId: string, updates: Partial<TaskCard>) => void;
  onMoveCard?: (cardId: string, targetColumnId: string) => void;
}

export function KanbanCard({ 
  card, 
  onDelete, 
  onUpdate,
  onMoveCard
}: KanbanCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { usersData } = useUsers();
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;

  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  return (
    <>
      <CardContainer 
        backgroundColor={card.background_color} 
        onClick={handleCardClick}
      >
        <div className="space-y-2">
          <CardContent 
            title={card.title}
            description={card.description}
            priority={card.priority}
          />
          
          <CardTimer 
            dueDate={card.due_date} 
            dueTime={card.due_time} 
          />
          
          <CardMetaInfo
            dueDate={card.due_date}
            dueTime={card.due_time}
            assignee={assignee}
          />
        </div>
      </CardContainer>
      
      <CardDetails 
        card={card} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen}
        onMoveCard={onMoveCard}
      />
    </>
  );
}
