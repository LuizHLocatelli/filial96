import { format, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Folga } from "./types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Definindo um tipo básico para Consultor para resolver erros de lint
// O ideal é que isso venha de um arquivo de tipos compartilhado ou específico
interface Consultor {
  id: string;
  nome: string;
  avatar?: string; 
}

interface FolgasCalendarProps {
  currentMonth: Date;
  folgas: Folga[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  onDateClick: (date: Date) => void;
  getConsultorById: (id: string) => Consultor | undefined; // Usando o tipo Consultor definido
}

export function FolgasCalendar({
  currentMonth,
  folgas,
  handlePrevMonth,
  handleNextMonth,
  onDateClick,
  getConsultorById,
}: FolgasCalendarProps) {
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  const getFolgasForDay = (day: Date): Folga[] => {
    return folgas.filter(f => 
      new Date(f.data).toDateString() === day.toDateString()
    );
  };
  
  const getConsultoresForDay = (day: Date): Consultor[] => {
    const folgasNoDia = getFolgasForDay(day);
    return folgasNoDia.map(f => 
      getConsultorById(f.consultorId)
    ).filter(Boolean) as Consultor[]; // Type assertion para Consultor[]
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2 mb-2">
          <CardTitle className="text-lg sm:text-xl font-semibold">Calendário de Folgas</CardTitle>
          <div className="flex items-center space-x-1.5">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <span className="font-medium text-base sm:text-lg min-w-[140px] sm:min-w-[150px] text-center">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Clique em um dia para adicionar ou visualizar detalhes das folgas.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 py-2 sm:px-3 sm:py-3">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dayName) => (
            <div key={dayName} className="text-center font-medium text-xs text-muted-foreground pb-2">
              {dayName}
            </div>
          ))}
          
          {/* Espaços vazios antes do primeiro dia do mês */}
          {Array.from({ length: firstDayOfMonth.getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="border rounded-md bg-muted/30 aspect-square"></div>
          ))}
          
          {daysInMonth.map((day) => {
            const consultoresNoDia = getConsultoresForDay(day);
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isDiaDeHoje = isToday(day);
            const hasFolgas = consultoresNoDia.length > 0;
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "border rounded-md flex flex-col items-center justify-start p-1.5 sm:p-2 cursor-pointer aspect-square transition-all duration-150 ease-in-out",
                  !isCurrentMonthDay && "bg-muted/30 text-muted-foreground/50 pointer-events-none",
                  isCurrentMonthDay && "hover:bg-accent hover:shadow-lg hover:scale-105",
                  isDiaDeHoje && "border-primary ring-2 ring-primary/70 shadow-lg",
                  hasFolgas && isCurrentMonthDay && "bg-blue-500/10 dark:bg-blue-700/20 border-blue-500/30"
                )}
                onClick={() => isCurrentMonthDay && onDateClick(day)}
                title={isCurrentMonthDay ? format(day, "dd 'de' MMMM", { locale: ptBR }) : "Dia de outro mês"}
              >
                <div className={cn(
                  "font-semibold text-xs sm:text-sm mb-1",
                  isDiaDeHoje && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </div>
                {isCurrentMonthDay && hasFolgas && (
                  <div className="flex -space-x-1 overflow-hidden justify-center w-full">
                    {consultoresNoDia.slice(0, 2).map((consultor) => (
                      <TooltipProvider key={consultor.id}> {/* consultor.id agora deve ser seguro */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-background">
                              <AvatarImage src={consultor.avatar} alt={consultor.nome} />
                              <AvatarFallback className="text-[8px] sm:text-[10px]">
                                {/* consultor.nome agora deve ser seguro */}
                                {consultor.nome ? consultor.nome.substring(0, 1).toUpperCase() : "-"}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{consultor.nome || "Consultor"}</p> {/* consultor.nome agora deve ser seguro */}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {consultoresNoDia.length > 2 && (
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-muted-foreground/20 text-muted-foreground text-[8px] sm:text-[10px] flex items-center justify-center border-2 border-background">
                        +{consultoresNoDia.length - 2}
                      </div>
                    )}
                  </div>
                )}
                {!isCurrentMonthDay && (
                    <div className="h-full w-full flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
