import { format, isSameMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cliente, getIndicatorColor } from "../types";
import { Badge } from "@/components/ui/badge";

interface ClienteCalendarProps {
  clientes: Cliente[];
  currentMonth: Date;
  daysInMonth: Date[];
  prevMonth: () => void;
  nextMonth: () => void;
}

export function ClienteCalendar({ 
  clientes,
  currentMonth,
  daysInMonth,
  prevMonth,
  nextMonth,
}: ClienteCalendarProps) {
  const getClientesForDay = (day: Date) => {
    return clientes.filter(cliente => 
      isSameMonth(cliente.diaPagamento, day) && 
      isSameDay(cliente.diaPagamento, day)
    );
  };

  const getDayClass = (day: Date, clientesNoDay: Cliente[]) => {
    if (clientesNoDay.length === 0) return "";
    
    // If there's more than one client for this day with different indicators,
    // we'll use a gradient or special class
    if (clientesNoDay.length > 1) {
      const uniqueIndicators = [...new Set(clientesNoDay.map(c => c.indicator))];
      if (uniqueIndicators.length > 1) {
        return "bg-gradient-to-r from-blue-200 to-pink-200";
      }
    }
    
    // If there's only one client or all clients have the same indicator
    const indicator = clientesNoDay[0]?.indicator;
    if (!indicator) return "bg-blue-200";
    
    switch(indicator) {
      case "FPD": return "bg-red-200";
      case "Pontual": return "bg-green-200";
      case "M1": return "bg-yellow-200";
      case "M2": return "bg-orange-200";
      case "M3": return "bg-purple-200";
      default: return "bg-blue-200";
    }
  };

  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <CardTitle>Calendário de Pagamentos</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Visualize os clientes agendados em cada dia do mês
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 py-2 sm:px-4 sm:py-3">
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
            const clientesNoDay = getClientesForDay(day);
            const isWeekend = [0, 6].includes(day.getDay());
            const dayClass = getDayClass(day, clientesNoDay);
            
            return (
              <div
                key={day.toString()}
                className={`
                  p-1 min-h-14 border rounded-md flex flex-col justify-between
                  ${isWeekend ? "bg-gray-50" : ""}
                  ${dayClass}
                `}
              >
                <div className="font-medium text-sm">{day.getDate()}</div>
                {clientesNoDay.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {clientesNoDay.slice(0, 2).map((cliente, index) => (
                      <div key={`${cliente.id}-${index}`} className="text-xs truncate flex items-center gap-1">
                        {cliente.indicator && (
                          <span className={`h-2 w-2 rounded-full inline-block ${getIndicatorColor(cliente.indicator)}`} />
                        )}
                        {cliente.nome}
                      </div>
                    ))}
                    {clientesNoDay.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{clientesNoDay.length - 2} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-xs flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-red-200 inline-block" /> FPD
          </div>
          <div className="text-xs flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-200 inline-block" /> Pontual
          </div>
          <div className="text-xs flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-yellow-200 inline-block" /> M1
          </div>
          <div className="text-xs flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-orange-200 inline-block" /> M2
          </div>
          <div className="text-xs flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-purple-200 inline-block" /> M3
          </div>
          <div className="text-xs flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-200 to-pink-200 inline-block" /> Múltiplos
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
