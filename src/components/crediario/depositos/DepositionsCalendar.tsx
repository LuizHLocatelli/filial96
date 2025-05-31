import { format, isSameDay, isAfter, setHours, setMinutes, setSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronLeft, ChevronRight, ImageIcon, Clock, AlertTriangle, XCircle } from "lucide-react";
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
  
  // Helper function to get deposit status for a day
  const getDayStatus = (day: Date) => {
    const depositosForDay = depositos.filter(deposito => isSameDay(deposito.data, day));
    const isWeekend = day.getDay() === 0; // Apenas domingo (0) é não obrigatório
    const isToday = isSameDay(day, new Date());
    const deadline = setSeconds(setMinutes(setHours(new Date(day), 12), 0), 0);
    const hasPassed = isAfter(new Date(), deadline) && isSameDay(day, new Date());
    
    if (isWeekend) {
      return {
        status: 'weekend',
        color: 'bg-gray-100 border-gray-200 text-gray-600',
        icon: null,
        label: 'Domingo'
      };
    }
    
    if (depositosForDay.length === 0) {
      if (hasPassed) {
        return {
          status: 'missed',
          color: 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100',
          icon: XCircle,
          label: 'Perdeu prazo'
        };
      } else if (isToday) {
        return {
          status: 'pending-today',
          color: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100',
          icon: Clock,
          label: 'Pendente hoje'
        };
      } else {
        return {
          status: 'pending',
          color: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
          icon: null,
          label: 'Pendente'
        };
      }
    }
    
    const hasReceipt = depositosForDay.some(d => d.comprovante);
    const isIncluded = depositosForDay.some(d => d.ja_incluido);
    
    if (hasReceipt && isIncluded) {
      return {
        status: 'complete',
        color: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
        icon: CheckCircle,
        label: 'Completo'
      };
    } else if (hasReceipt && !isIncluded) {
      return {
        status: 'partial',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100',
        icon: AlertTriangle,
        label: 'Pendente sistema'
      };
    }
    
    return {
      status: 'incomplete',
      color: 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100',
      icon: Clock,
      label: 'Incompleto'
    };
  };

  // Calculate monthly stats
  const monthlyStats = () => {
    const workingDays = diasDoMes.filter(day => day.getDay() !== 0); // Excluir apenas domingo
    const completeDays = workingDays.filter(day => {
      const status = getDayStatus(day);
      return status.status === 'complete';
    });
    const missedDays = workingDays.filter(day => {
      const status = getDayStatus(day);
      return status.status === 'missed';
    });
    
    return {
      workingDays: workingDays.length,
      completeDays: completeDays.length,
      missedDays: missedDays.length,
      completion: workingDays.length > 0 ? Math.round((completeDays.length / workingDays.length) * 100) : 0
    };
  };

  const stats = monthlyStats();

  return (
    <Card className="w-full border shadow-soft">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Calendário de Depósitos</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Acompanhamento diário dos depósitos bancários
            </CardDescription>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center text-sm">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{stats.completion}%</div>
            <div className="text-xs text-muted-foreground">Taxa de conclusão</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.completeDays}</div>
            <div className="text-xs text-muted-foreground">Dias completos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.missedDays}</div>
            <div className="text-xs text-muted-foreground">Dias perdidos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.workingDays}</div>
            <div className="text-xs text-muted-foreground">Dias úteis</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completo
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pendente Sistema
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Perdido
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
            Domingo
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Header dos dias da semana */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
            <div key={day} className={`text-center font-medium p-2 text-xs ${
              index === 0 || index === 6 ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {isMobile ? day.charAt(0) : day}
            </div>
          ))}
          
          {/* Espaços vazios antes do primeiro dia do mês */}
          {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="p-1"></div>
          ))}
          
          {/* Dias do mês */}
          {diasDoMes.map((day) => {
            const dayStatus = getDayStatus(day);
            const depositosForDay = depositos.filter(deposito => isSameDay(deposito.data, day));
            const isToday = isSameDay(day, new Date());
            const hasComprovantes = depositosForDay.some(d => d.comprovante);
            const StatusIcon = dayStatus.icon;
            
            // Get the earliest deposit time for the day
            const earliestDeposit = depositosForDay.length > 0 
              ? depositosForDay.reduce((earliest, current) => 
                  current.data < earliest.data ? current : earliest
                )
              : null;
            
            return (
              <button
                key={day.toString()}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`
                  relative p-1 h-16 sm:h-20 border-2 rounded-lg flex flex-col items-center justify-center
                  transition-all duration-200 group
                  ${dayStatus.color}
                  ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                `}
                title={dayStatus.label}
              >
                {/* Número do dia */}
                <div className="font-semibold text-sm sm:text-base mb-1">
                  {day.getDate()}
                </div>
                
                {/* Status e informações */}
                <div className="flex items-center justify-center gap-1">
                  {StatusIcon && (
                    <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  
                  {depositosForDay.length > 1 && (
                    <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                      {depositosForDay.length}
                    </span>
                  )}
                </div>
                
                {/* Horário do depósito */}
                {earliestDeposit && (
                  <div className="text-[9px] sm:text-[10px] opacity-70 mt-0.5">
                    {format(earliestDeposit.data, "HH:mm")}
                  </div>
                )}
                
                {/* Thumbnail do comprovante */}
                {hasComprovantes && (
                  <ImageIcon 
                    className="absolute top-1 right-1 h-3 w-3 text-blue-500 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      const firstWithImage = depositosForDay.find(d => d.comprovante);
                      if (firstWithImage?.comprovante) {
                        setViewImage(firstWithImage.comprovante);
                      }
                    }}
                  />
                )}
                
                {/* Indicador de hoje */}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
