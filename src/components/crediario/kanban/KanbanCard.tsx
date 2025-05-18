
import { useState, useEffect } from "react";
import { TaskCard } from "./types";
import { CardDetails } from "./CardDetails";
import { useUsers } from "./useUsers";
import { CardContent } from "./components/CardContent";
import { CardMetaInfo } from "./components/CardMetaInfo";
import { getTextColor } from "@/lib/utils";
import { differenceInSeconds, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";

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
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isPastDue, setIsPastDue] = useState(false);
  const { usersData } = useUsers();
  
  const assignee = card.assignee_id 
    ? usersData.find(user => user.id === card.assignee_id) 
    : null;

  // Atualiza o tempo restante a cada segundo
  useEffect(() => {
    if (!card.due_date) return;

    const dueDate = new Date(card.due_date);
    if (card.due_time) {
      const [hours, minutes] = card.due_time.split(':').map(Number);
      dueDate.setHours(hours, minutes);
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(dueDate, now);
      
      if (diffInSeconds <= 0) {
        setIsPastDue(true);
        setTimeRemaining(formatDistanceToNow(dueDate, { addSuffix: true, locale: ptBR }));
      } else {
        setIsPastDue(false);
        setTimeRemaining(formatDistanceToNow(dueDate, { addSuffix: true, locale: ptBR }));
      }
    };

    // Atualiza imediatamente
    updateTimeRemaining();
    
    // Configura atualizações a cada segundo
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [card.due_date, card.due_time]);

  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  // Determine the text color based on the card's background color
  const textColor = getTextColor(card.background_color);
  
  // Determinar a cor de fundo do timer com base no tempo restante
  const getTimerStyle = () => {
    if (isPastDue) {
      return {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        color: "rgb(239, 68, 68)",
        borderColor: "rgba(239, 68, 68, 0.5)"
      };
    }
    return {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      color: textColor,
      borderColor: "rgba(59, 130, 246, 0.3)"
    };
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="p-3 rounded-md border shadow-sm cursor-pointer hover:shadow-md transition-shadow dark:border-gray-700"
        style={{ 
          backgroundColor: card.background_color || (isDarkMode() ? '#2a2a2a' : 'white'),
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
          
          {timeRemaining && card.due_date && (
            <div 
              className="mt-2 text-xs px-2 py-1 rounded-md border flex items-center gap-1"
              style={getTimerStyle()}
            >
              <Clock className="h-3 w-3" />
              <span>{timeRemaining}</span>
            </div>
          )}
          
          <CardMetaInfo
            dueDate={card.due_date}
            dueTime={card.due_time}
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

// Função para detectar o modo escuro
function isDarkMode() {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return false;
}
