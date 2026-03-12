import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EscalaShiftBadge } from "./EscalaShiftBadge";
import { EscalaDayData } from "../hooks/useEscalas";
import { EscalaCarga } from "@/types/shared/escalas";
import { cn } from "@/lib/utils";
import { Truck } from "lucide-react";

interface EscalaDayCardProps {
  day: EscalaDayData;
  isManager: boolean;
  onEditShift?: (shift: EscalaCarga) => void;
}

function ShiftRow({ shift, isMirror, isManager, onEdit }: {
  shift: EscalaCarga;
  isMirror: boolean;
  isManager: boolean;
  onEdit?: (s: EscalaCarga) => void;
}) {
  const userName = (shift.user as { name?: string })?.name || "?";
  const avatarUrl = (shift.user as { avatar_url?: string })?.avatar_url || "";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => isManager && onEdit?.(shift)}
            className={cn(
              "flex flex-col gap-1 w-full rounded-md p-1.5 text-left transition-colors",
              shift.is_carga
                ? "bg-primary/8 hover:bg-primary/15"
                : "hover:bg-muted/60",
              isManager && "cursor-pointer"
            )}
          >
            <div className="flex items-center gap-1.5 w-full min-w-0 flex-1">
              <Avatar className={cn(
                "h-5 w-5 flex-shrink-0 ring-1",
                shift.is_carga ? "ring-primary/30" : "ring-border/50"
              )}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-[9px] font-medium">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-medium truncate flex-1 min-w-0">{userName}</span>
            </div>

            <EscalaShiftBadge
              shiftStart={shift.shift_start}
              shiftEnd={shift.shift_end}
              isCarga={shift.is_carga}
              isMirror={isMirror}
              compact
              className="w-full justify-center"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p className="font-semibold">{userName}</p>
            <p>{shift.is_carga ? (isMirror ? "Espelho da Carga" : "Carga") : "Normal"}</p>
            <p className="font-mono">{shift.shift_start.substring(0, 5)} → {shift.shift_end.substring(0, 5)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const EscalaDayCard = memo(function EscalaDayCard({ day, isManager, onEditShift }: EscalaDayCardProps) {
  const { dateStr, dayOfWeek, dayNumber, isSunday, isToday: isDayToday, cargaShifts, normalShifts, isMirrorDay } = day;
  const hasShifts = cargaShifts.length > 0 || normalShifts.length > 0;

  if (isSunday) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 bg-muted/20 p-3 min-h-[100px] opacity-50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{dayOfWeek}</span>
          <span className="text-sm font-semibold text-muted-foreground/60">{dayNumber}</span>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-4 text-center">Domingo</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-3 min-h-[100px] transition-all",
      isDayToday
        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
        : "border-border/60 bg-card hover:border-border",
      !hasShifts && !isSunday && "bg-muted/10"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-[10px] uppercase tracking-wider font-medium",
          isDayToday ? "text-primary" : "text-muted-foreground"
        )}>
          {dayOfWeek}
        </span>
        <div className="flex items-center gap-1">
          {cargaShifts.length > 0 && !isMirrorDay && (
            <Truck className="h-3 w-3 text-primary opacity-60" />
          )}
          <span className={cn(
            "text-sm font-bold",
            isDayToday
              ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
              : "text-foreground"
          )}>
            {dayNumber}
          </span>
        </div>
      </div>

      {/* Shifts */}
      {hasShifts ? (
        <div className="space-y-0.5">
          {cargaShifts.map(shift => (
            <ShiftRow
              key={shift.id}
              shift={shift}
              isMirror={isMirrorDay}
              isManager={isManager}
              onEdit={onEditShift}
            />
          ))}
          {normalShifts.map(shift => (
            <ShiftRow
              key={shift.id}
              shift={shift}
              isMirror={false}
              isManager={isManager}
              onEdit={onEditShift}
            />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground/40 mt-4 text-center">Sem escala</p>
      )}
    </div>
  );
});
