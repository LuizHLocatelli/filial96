
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
        <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50 shadow-sm"
        >
          <Crown className="h-3 w-3 mr-1" />
          Sem limite de tempo
        </Badge>
      </div>
    );
  }

  if (timeRemaining.expired) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
        <Badge 
          variant="destructive" 
          className="flex items-center gap-1 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/50 shadow-sm"
        >
          <Clock className="h-3 w-3" />
          Expirada
        </Badge>
      </div>
    );
  }

  const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
  let variant: "default" | "secondary" | "destructive" = "default";
  let colorClass = "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/50";

  if (totalHours <= 12) {
    variant = "destructive";
    colorClass = "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/50";
  } else if (totalHours <= 24) {
    variant = "secondary";
    colorClass = "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/50";
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
      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
      <Badge 
        variant={variant} 
        className={cn("flex items-center gap-1 shadow-sm", colorClass)}
      >
        <Clock className="h-3 w-3" />
        {formatTime()} restantes
      </Badge>
    </div>
  );
}
