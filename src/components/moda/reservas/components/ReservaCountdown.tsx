import { Badge } from "@/components/ui/badge";
import { Clock, Crown, Infinity } from "lucide-react";
import { useReservasCountdown } from "../hooks/useReservasCountdown";
import { cn } from "@/lib/utils";

interface ReservaCountdownProps {
  dataExpiracao: string;
  status: string;
  clienteVip?: boolean;
}

export function ReservaCountdown({ dataExpiracao, status, clienteVip = false }: ReservaCountdownProps) {
  const timeRemaining = useReservasCountdown(dataExpiracao);

  if (status !== 'ativa') {
    return null;
  }

  // Para clientes VIP, mostrar badge especial
  if (clienteVip) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Crown className="h-3 w-3 mr-1" />
          Sem limite de tempo
        </Badge>
      </div>
    );
  }

  if (timeRemaining.expired) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Expirada
        </Badge>
      </div>
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
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Badge 
        variant={variant} 
        className={cn("flex items-center gap-1", colorClass)}
      >
        <Clock className="h-3 w-3" />
        {formatTime()} restantes
      </Badge>
    </div>
  );
}
