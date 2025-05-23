
import { format, isToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Folga } from "./types";

interface FolgasCalendarProps {
  currentMonth: Date;
  weeks: Date[][];
  folgas: Folga[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  onDateClick: (date: Date) => void;
  getConsultorById: (id: string) => any | undefined;
}

export function FolgasCalendar({
  currentMonth,
  weeks,
  folgas,
  handlePrevMonth,
  handleNextMonth,
  onDateClick,
  getConsultorById,
}: FolgasCalendarProps) {
  const renderDayNames = () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderFolgasForDay = (day: Date) => {
    const dayFolgas = folgas.filter(
      (folga) => folga.data.toDateString() === day.toDateString()
    );

    return dayFolgas.map((folga) => {
      const consultor = getConsultorById(folga.consultorId);
      return (
        <div
          key={folga.id}
          className="bg-blue-100 dark:bg-blue-900 rounded px-1.5 py-0.5 text-xs overflow-hidden text-ellipsis whitespace-nowrap mb-1 text-blue-800 dark:text-blue-200"
          title={consultor ? consultor.nome : "Consultor não encontrado"}
        >
          {consultor ? consultor.nome.split(" ")[0] : "..."}
        </div>
      );
    });
  };

  return (
    <div className="border rounded-md p-3 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-2">
        {renderDayNames()}

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day, dayIndex) => {
              const isSameMonthDay = isSameMonth(day, currentMonth);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={dayIndex}
                  onClick={() => onDateClick(day)}
                  className={`border rounded-md cursor-pointer min-h-[80px] p-1 relative hover:bg-accent
                    ${!isSameMonthDay ? "bg-muted/30 text-muted-foreground" : ""}
                    ${isWeekend ? "bg-muted/60" : ""}
                    ${isDayToday ? "border-primary" : ""}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${isDayToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="overflow-y-auto max-h-[60px]">
                    {renderFolgasForDay(day)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
