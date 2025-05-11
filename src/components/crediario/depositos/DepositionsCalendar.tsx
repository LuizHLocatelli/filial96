
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

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <CardTitle className="text-xl">Calendário de Depósitos</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Clique em um dia para marcar como concluído ou adicionar um comprovante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center font-medium p-2 text-sm text-muted-foreground">
              {isMobile ? day.charAt(0) : day}
            </div>
          ))}
          
          {/* Espaços vazios antes do primeiro dia do mês */}
          {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="p-2"></div>
          ))}
          
          {/* Dias do mês */}
          {diasDoMes.map((day) => {
            const deposito = depositos.find(
              (deposito) => isSameDay(deposito.data, day)
            );
            
            const isWeekend = [0, 6].includes(day.getDay());
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toString()}
                type="button"
                onClick={() => !isWeekend && handleSelectDay(day)}
                disabled={isWeekend}
                className={`
                  p-1 sm:p-2 ${isMobile ? 'h-12' : 'h-16'} border rounded-md flex flex-col items-center justify-center
                  ${isToday ? "bg-muted" : ""}
                  ${isWeekend ? "bg-gray-50 opacity-50 cursor-not-allowed" : "hover:bg-muted/50"}
                  ${deposito?.concluido ? "border-green-500 border-2" : ""}
                `}
              >
                <div className="font-medium text-sm sm:text-base">{day.getDate()}</div>
                <div className="flex items-center gap-1">
                  {deposito?.concluido && (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  )}
                  {deposito?.comprovante && (
                    <ImageIcon 
                      className="h-3 w-3 text-blue-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewImage(deposito.comprovante!);
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
