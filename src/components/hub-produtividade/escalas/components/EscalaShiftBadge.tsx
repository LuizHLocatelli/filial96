import { Truck, Clock } from "@/components/ui/emoji-icons";
import { cn } from "@/lib/utils";

interface EscalaShiftBadgeProps {
  shiftStart: string;
  shiftEnd: string;
  isCarga: boolean;
  isMirror?: boolean;
  compact?: boolean;
  className?: string;
}

export function EscalaShiftBadge({ shiftStart, shiftEnd, isCarga, isMirror, compact, className }: EscalaShiftBadgeProps) {
  const time = `${shiftStart.substring(0, 5)}-${shiftEnd.substring(0, 5)}`;

  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium leading-none",
        isCarga
          ? isMirror
            ? "bg-primary/5 text-primary/80 ring-1 ring-inset ring-primary/10"
            : "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground",
        className
      )}>
        {isCarga && !isMirror && <Truck className="h-2.5 w-2.5 shrink-0" />}
        {isCarga && isMirror && <Clock className="h-2.5 w-2.5 shrink-0 opacity-70" />}
        <span className="truncate">{time}</span>
        {isCarga && isMirror && (
          <span className="text-[8px] opacity-70 ml-0.5 font-bold">ESP</span>
        )}
      </span>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
      isCarga
        ? isMirror
          ? "bg-primary/5 text-primary/80 border border-primary/10"
          : "bg-primary/10 text-primary border border-primary/20"
        : "bg-muted/60 text-muted-foreground border border-border/50"
    )}>
      {isCarga && !isMirror ? (
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
