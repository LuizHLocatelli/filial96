
import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";

interface CardTimerProps {
  dueDate: string | undefined;
  dueTime: string | undefined;
}

export function CardTimer({ dueDate, dueTime }: CardTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isPastDue, setIsPastDue] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Atualiza o tempo restante a cada segundo
  useEffect(() => {
    if (!dueDate) return;

    const dueDateTime = new Date(dueDate);
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      dueDateTime.setHours(hours, minutes);
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(dueDateTime, now);
      
      setSecondsLeft(diffInSeconds);
      
      if (diffInSeconds <= 0) {
        setIsPastDue(true);
        setTimeRemaining("Prazo expirado!");
      } else {
        setIsPastDue(false);
        
        // Calcular componentes de tempo individuais
        const days = differenceInDays(dueDateTime, now);
        const hours = differenceInHours(dueDateTime, now) % 24;
        const minutes = differenceInMinutes(dueDateTime, now) % 60;
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
  }, [dueDate, dueTime]);

  // No timer to display
  if (!timeRemaining || !dueDate) return null;

  // Determinar a cor de fundo do timer com base no tempo restante
  const getTimerStyle = () => {
    if (isPastDue) {
      return {
        backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)",
        color: isDarkMode ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
        borderColor: isDarkMode ? "rgba(239, 68, 68, 0.6)" : "rgba(239, 68, 68, 0.5)"
      };
    }
    
    // Adicionar cores de urgência baseadas no tempo restante
    if (secondsLeft !== null) {
      // Menos de 1 hora
      if (secondsLeft < 3600) {
        return {
          backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.15)",
          color: isDarkMode ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
          borderColor: isDarkMode ? "rgba(239, 68, 68, 0.5)" : "rgba(239, 68, 68, 0.4)"
        };
      }
      
      // Menos de 24 horas
      if (secondsLeft < 86400) {
        return {
          backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.15)",
          color: isDarkMode ? "rgb(251, 191, 36)" : "rgb(194, 65, 12)",
          borderColor: isDarkMode ? "rgba(245, 158, 11, 0.5)" : "rgba(245, 158, 11, 0.4)"
        };
      }
    }
    
    return {
      backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
      color: isDarkMode ? "#a3c6ff" : "inherit",
      borderColor: isDarkMode ? "rgba(59, 130, 246, 0.5)" : "rgba(59, 130, 246, 0.3)"
    };
  };

  return (
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
  );
}
