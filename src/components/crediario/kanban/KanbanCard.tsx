
import { useState, useEffect } from "react";
import { TaskCard } from "./types";
import { CardDetails } from "./CardDetails";
import { useUsers } from "./useUsers";
import { CardContent } from "./components/CardContent";
import { CardMetaInfo } from "./components/CardMetaInfo";
import { getTextColor } from "@/lib/utils";
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, AlertTriangle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isPastDue, setIsPastDue] = useState(false);
  const { usersData } = useUsers();
  const { isDarkMode } = useTheme();
  
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
      
      setSecondsLeft(diffInSeconds);
      
      if (diffInSeconds <= 0) {
        setIsPastDue(true);
        setTimeRemaining("Prazo expirado!");
      } else {
        setIsPastDue(false);
        
        // Calcular componentes de tempo individuais
        const days = differenceInDays(dueDate, now);
        const hours = differenceInHours(dueDate, now) % 24;
        const minutes = differenceInMinutes(dueDate, now) % 60;
        const seconds = diffInSeconds % 60;
        
        // Formatar o tempo restante de forma detalhada
        let formattedTime = "";
        
        if (days > 0) {
          formattedTime += `${days}d `;
        }
        
        if (hours > 0 || days > 0) {
          formattedTime += `${hours}h `;
        }
        
        if (minutes > 0 || hours > 0 || days > 0) {
          formattedTime += `${minutes}m `;
        }
        
        formattedTime += `${seconds}s`;
        
        setTimeRemaining(formattedTime);
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
    
    // Adicionar cores de urgência baseadas no tempo restante
    if (secondsLeft !== null) {
      // Menos de 1 hora
      if (secondsLeft < 3600) {
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "rgb(239, 68, 68)",
          borderColor: "rgba(239, 68, 68, 0.4)"
        };
      }
      
      // Menos de 24 horas
      if (secondsLeft < 86400) {
        return {
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          color: isDarkMode ? "rgb(251, 191, 36)" : "rgb(194, 65, 12)",
          borderColor: "rgba(245, 158, 11, 0.4)"
        };
      }
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
          backgroundColor: card.background_color || (isDarkMode ? '#2a2a2a' : 'white'),
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
              {isPastDue ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
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
        onMoveCard={onMoveCard}
      />
    </>
  );
}
