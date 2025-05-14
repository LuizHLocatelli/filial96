
import { useState } from "react";
import { TaskCard } from "./types";
import { CardDetails } from "./CardDetails";
import { useUsers } from "./useUsers";
import { CardContent } from "./components/CardContent";
import { CardMetaInfo } from "./components/CardMetaInfo";
import { getTextColor } from "@/lib/utils";

interface KanbanCardProps {
  card: TaskCard;
  onDelete?: () => void;
  onUpdate?: (cardId: string, updates: Partial<TaskCard>) => void;
}

export function KanbanCard({ 
  card, 
  onDelete, 
  onUpdate 
}: KanbanCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { usersData } = useUsers();
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;

  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  // Determine the text color based on the card's background color
  const textColor = getTextColor(card.background_color);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="p-3 rounded-md border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        style={{ 
          backgroundColor: card.background_color || 'white',
          color: textColor
        }}
      >
        <div className="space-y-2">
          <CardContent 
            title={card.title}
            description={card.description}
            priority={card.priority}
            textColor={textColor}
          />
          
          <CardMetaInfo
            dueDate={card.due_date}
            dueTime={card.due_time} // Pass the dueTime to CardMetaInfo
            assignee={assignee}
            textColor={textColor}
          />
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
