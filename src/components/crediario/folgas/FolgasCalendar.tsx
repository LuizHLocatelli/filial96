
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crediarista, Folga } from "./types";

interface FolgasCalendarProps {
  currentMonth: Date;
  crediaristas: Crediarista[];
  folgas: Folga[];
  isLoadingCrediaristas: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (date: Date) => void;
}

export function FolgasCalendar({
  currentMonth,
  crediaristas,
  folgas,
  isLoadingCrediaristas,
  onPrevMonth,
  onNextMonth,
  onDateClick
}: FolgasCalendarProps) {
  // Função para gerar os dias do mês atual para o calendário
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };
  
  // Dias do mês atual
  const daysInMonth = getDaysInMonth();
  
  // Obter folgas para um dia específico
  const getFolgasForDay = (day: Date) => {
    return folgas.filter(folga => 
      isSameDay(folga.data, day)
    );
  };
  
  // Obter os crediaristas que têm folga em um dia específico
  const getCrediaristasForDay = (day: Date) => {
    const folgasNoDay = getFolgasForDay(day);
    return folgasNoDay.map(folga => 
      crediaristas.find(c => c.id === folga.crediaristaId)
    ).filter(Boolean) as Crediarista[];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <CardTitle>Calendário de Folgas</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={onPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Visualize as folgas por crediarista em cada dia do mês
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 py-2 sm:px-4 sm:py-3">
        {isLoadingCrediaristas ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center font-medium p-1 text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Espaços vazios antes do primeiro dia do mês */}
              {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="p-1"></div>
              ))}
              
              {/* Dias do mês */}
              {daysInMonth.map((day) => {
                const crediaristasNoDay = getCrediaristasForDay(day);
                const isWeekend = [0, 6].includes(day.getDay());
                const hasFolgas = crediaristasNoDay.length > 0;
                
                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "p-1 min-h-14 border rounded-md flex flex-col justify-between cursor-pointer transition-colors",
                      isWeekend ? "bg-gray-50 dark:bg-gray-900/20" : "",
                      hasFolgas ? "bg-blue-50 dark:bg-blue-900/20" : "",
                      "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    )}
                    onClick={() => onDateClick(day)}
                  >
                    <div className="font-medium text-sm">{day.getDate()}</div>
                    {hasFolgas && (
                      <div className="mt-1 space-y-1">
                        {crediaristasNoDay.slice(0, 2).map((crediarista, index) => (
                          <div key={`${crediarista.id}-${index}`} className="text-xs truncate">
                            {crediarista.nome}
                          </div>
                        ))}
                        {crediaristasNoDay.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{crediaristasNoDay.length - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
