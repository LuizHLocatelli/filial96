
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useReservasCountdown } from "../hooks/useReservasCountdown";
import { cn } from "@/lib/utils";

interface ReservaCountdownProps {
  dataExpiracao: string;
  status: string;
}

export function ReservaCountdown({ dataExpiracao, status }: ReservaCountdownProps) {
  const timeRemaining = useReservasCountdown(dataExpiracao);

  if (status !== 'ativa') {
    return null;
  }

  if (timeRemaining.expired) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Expirada
      </Badge>
    );
  }

  const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
  let variant: "default" | "secondary" | "destructive" = "default";
  let colorClass = "bg-green-100 text-green-800 border-green-200";

  if (totalHours <= 12) {
    variant = "destructive";
    colorClass = "bg-red-100 text-red-800 border-red-200";
  } else if (totalHours <= 24) {
    variant = "secondary";
    colorClass = "bg-orange-100 text-orange-800 border-orange-200";
  }

  const formatTime = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else {
      return `${timeRemaining.minutes}m`;
    }
  };

  return (
    <Badge 
      variant={variant} 
      className={cn("flex items-center gap-1", colorClass)}
    >
      <Clock className="h-3 w-3" />
      {formatTime()} restantes
    </Badge>
  );
}
