import { ChevronLeft, ChevronRight, Calendar, Plus, Trash2 } from "@/components/ui/emoji-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EscalaHeaderProps {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isManager: boolean;
  onGenerate: () => void;
  onClear: () => void;
}

export function EscalaHeader({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  onToday,
  isManager,
  onGenerate,
  onClear,
}: EscalaHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Month navigator */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight capitalize min-w-[180px] text-center select-none">
          {monthLabel}
        </h2>

        <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onToday} className="ml-1 text-xs h-7">
          <Calendar className="h-3 w-3 mr-1" />
          Hoje
        </Button>
      </div>

      {/* Manager actions */}
      {isManager && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Apagar
          </Button>
          <Button size="sm" onClick={onGenerate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Gerar Escala
          </Button>
        </div>
      )}
    </div>
  );
}
