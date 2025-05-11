
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Cliente } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClienteCalendarProps {
  currentMonth: Date;
  daysInMonth: Date[];
  clientes: Cliente[];
  prevMonth: () => void;
  nextMonth: () => void;
}

export function ClienteCalendar({ 
  currentMonth, 
  daysInMonth, 
  clientes,
  prevMonth,
  nextMonth 
}: ClienteCalendarProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className={isMobile ? "px-2 py-3" : ""}>
        <div className={`flex ${isMobile ? "flex-col" : "justify-between"} items-center space-y-2`}>
          <CardTitle className="text-xl">Calendário de Agendamentos</CardTitle>
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
        <CardDescription className="text-center px-2">
          Visualize e gerencie os clientes agendados para cada dia
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-1 py-2" : ""}>
        <div className="grid grid-cols-7 gap-1">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center font-medium p-1 text-xs sm:text-sm text-muted-foreground">
              {isMobile ? day.charAt(0) : day}
            </div>
          ))}
          
          {/* Preencher os dias vazios no começo do mês */}
          {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="p-1"></div>
          ))}
          
          {/* Dias do mês */}
          {daysInMonth.map((day) => {
            const clientesNoDia = clientes.filter((cliente) =>
              cliente.diaPagamento.getDate() === day.getDate() &&
              cliente.diaPagamento.getMonth() === day.getMonth() &&
              cliente.diaPagamento.getFullYear() === day.getFullYear()
            );
            
            const isToday = new Date().toDateString() === day.toDateString();
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  `p-1 ${isMobile ? 'h-14 sm:h-18' : 'h-24'} border rounded-md overflow-y-auto`,
                  isToday ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <div className="text-right font-medium text-xs sm:text-sm">{day.getDate()}</div>
                {clientesNoDia.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {clientesNoDia.map((cliente) => (
                      <div
                        key={cliente.id}
                        className={cn(
                          "text-xs p-1 rounded truncate",
                          cliente.tipo === "pagamento"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        )}
                        title={cliente.nome}
                      >
                        {isMobile ? cliente.nome.substring(0, 3) + "..." : cliente.nome}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          
          {/* Preencher os dias vazios no fim do mês */}
          {Array.from({ length: 6 - daysInMonth[daysInMonth.length - 1].getDay() }).map((_, i) => (
            <div key={`empty-end-${i}`} className="p-1"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
