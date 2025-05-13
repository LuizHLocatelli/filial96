
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deposito } from "@/hooks/crediario/useDepositos";
import { useIsMobile } from "@/hooks/use-mobile";

interface DepositionsCalendarProps {
  currentMonth: Date;
  diasDoMes: Date[];
  depositos: Deposito[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleSelectDay: (day: Date) => void;
  setViewImage: (url: string | null) => void;
}

export function DepositionsCalendar({
  currentMonth,
  diasDoMes,
  depositos,
  handlePrevMonth,
  handleNextMonth,
  handleSelectDay,
  setViewImage
}: DepositionsCalendarProps) {
  const isMobile = useIsMobile();
  
  // Helper function to count deposits for a specific day
  const countDepositsForDay = (day: Date) => {
    return depositos.filter(deposito => isSameDay(deposito.data, day)).length;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <CardTitle className="text-lg sm:text-xl">Calendário de Depósitos</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center text-sm">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-center sm:text-left text-xs sm:text-sm">
          Clique em um dia para adicionar ou visualizar comprovantes
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 py-2 sm:px-4 sm:py-3">
        <div className="grid grid-cols-7 gap-1">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center font-medium p-1 text-xs text-muted-foreground">
              {day.charAt(0)}
            </div>
          ))}
          
          {/* Espaços vazios antes do primeiro dia do mês */}
          {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="p-1"></div>
          ))}
          
          {/* Dias do mês */}
          {diasDoMes.map((day) => {
            const depositosForDay = depositos.filter(
              (deposito) => isSameDay(deposito.data, day)
            );
            
            const isToday = isSameDay(day, new Date());
            const depositCount = depositosForDay.length;
            const hasComprovantes = depositosForDay.some(d => d.comprovante);
            
            return (
              <button
                key={day.toString()}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`
                  p-1 h-9 sm:h-14 border rounded-md flex flex-col items-center justify-center
                  ${isToday ? "bg-muted" : ""}
                  hover:bg-muted/50
                  ${depositCount > 0 ? "border-green-500 border-2" : ""}
                `}
              >
                <div className="font-medium text-xs sm:text-sm">{day.getDate()}</div>
                <div className="flex items-center gap-1">
                  {depositCount > 0 && (
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {depositCount > 1 && 
                        <span className="text-[10px] ml-0.5 text-green-600">{depositCount}</span>
                      }
                    </div>
                  )}
                  {hasComprovantes && (
                    <ImageIcon 
                      className="h-3 w-3 text-blue-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show the first image for now, we'll implement multi-image view later
                        const firstWithImage = depositosForDay.find(d => d.comprovante);
                        if (firstWithImage?.comprovante) {
                          setViewImage(firstWithImage.comprovante);
                        }
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
