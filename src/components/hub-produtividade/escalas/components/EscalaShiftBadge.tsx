import { Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscalaShiftBadgeProps {
  shiftStart: string;
  shiftEnd: string;
  isCarga: boolean;
  isMirror?: boolean;
  compact?: boolean;
}

export function EscalaShiftBadge({ shiftStart, shiftEnd, isCarga, isMirror, compact }: EscalaShiftBadgeProps) {
  const time = `${shiftStart.substring(0, 5)}-${shiftEnd.substring(0, 5)}`;

  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
        isCarga
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground"
      )}>
        {isCarga && <Truck className="h-2.5 w-2.5" />}
        {time}
      </span>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
      isCarga
        ? "bg-primary/10 text-primary border border-primary/20"
        : "bg-muted/60 text-muted-foreground border border-border/50"
    )}>
      {isCarga ? (
        <Truck className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3 opacity-60" />
      )}
      <span className="font-mono">{time}</span>
      {isCarga && isMirror && (
        <span className="text-[9px] opacity-70 ml-0.5">ESP</span>
      )}
    </div>
  );
}
