import { useMemo, useCallback } from "react";
import { format, isSameDay, isAfter, setHours, setMinutes, setSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deposito, DepositoStatistics } from "@/hooks/crediario/useDepositos";
import { useIsMobile } from "@/hooks/use-mobile";
import { DEPOSIT_SYSTEM_START_DATE } from "@/lib/constants";

interface DepositionsCalendarProps {
  currentMonth: Date;
  diasDoMes: Date[];
  depositos: Deposito[];
  monthStatistics?: DepositoStatistics | null;
  lastResetDate?: Date | null;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleSelectDay: (day: Date) => void;
  handleRefreshStatistics?: () => void;
  setViewImage: (url: string | null) => void;
}

export function DepositionsCalendar({
  currentMonth,
  diasDoMes,
  depositos,
  monthStatistics,
  lastResetDate,
  handlePrevMonth,
  handleNextMonth,
  handleSelectDay,
  handleRefreshStatistics,
  setViewImage
}: DepositionsCalendarProps) {
  const isMobile = useIsMobile();
  
  // Helper function to get deposit status for a day - memoized
  const getDayStatus = useCallback((day: Date) => {
    const depositosForDay = depositos.filter(deposito => isSameDay(deposito.data, day));
    const isWeekend = day.getDay() === 0; // Apenas domingo (0) é não obrigatório
    const isToday = isSameDay(day, new Date());
    const today = new Date();
    const dayEndOfDay = new Date(day);
    dayEndOfDay.setHours(23, 59, 59, 999); // Final do dia
    
    // Considerar apenas dias a partir de 18/06/2025 (início do uso do sistema)
    const isBeforeSystemStart = day < DEPOSIT_SYSTEM_START_DATE;
    
    // Se há uma data de reset, considerar apenas dias após o reset
    const isBeforeLastReset = lastResetDate ? day < lastResetDate : false;
    
    // Dia já passou completamente, está após início do sistema e após o último reset (se houver)
    const hasPassed = today > dayEndOfDay && !isBeforeSystemStart && !isBeforeLastReset;
    
    // Se é antes do último reset, mostrar como não aplicável
    if (isBeforeLastReset) {
      return {
        status: 'not-applicable',
        color: 'bg-muted border-border text-muted-foreground dark:bg-muted dark:border-border dark:text-muted-foreground',
        icon: null,
        label: 'Período anterior ao reset'
      };
    }
    
    if (isWeekend) {
      return {
        status: 'weekend',
        color: 'bg-muted border-border text-muted-foreground dark:bg-muted dark:border-border dark:text-muted-foreground',
        icon: null,
        label: 'Domingo'
      };
    }
    
    // Se é antes do início do sistema, mostrar como não aplicável
    if (isBeforeSystemStart) {
      return {
        status: 'not-applicable',
        color: 'bg-muted border-border text-muted-foreground dark:bg-muted dark:border-border dark:text-muted-foreground',
        icon: null,
        label: 'Antes do início do sistema'
      };
    }
    
    if (depositosForDay.length === 0) {
      if (hasPassed) {
        return {
          status: 'missed',
          color: 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/70',
          icon: XCircle,
          label: 'Perdeu prazo'
        };
      } else if (isToday) {
        return {
          status: 'pending-today',
          color: 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20',
          icon: Clock,
          label: 'Pendente hoje'
        };
      } else {
        return {
          status: 'pending',
          color: 'bg-muted border-border text-muted-foreground hover:bg-muted/80 dark:bg-muted dark:border-border dark:text-muted-foreground dark:hover:bg-muted/80',
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
        color: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 dark:bg-green-950/50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/70',
        icon: CheckCircle,
        label: 'Completo'
      };
    } else if (hasReceipt && !isIncluded) {
      return {
        status: 'partial',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950/70',
        icon: AlertTriangle,
        label: 'Pendente tesouraria'
      };
    }
    
    return {
      status: 'incomplete',
      color: 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/70',
      icon: Clock,
      label: 'Incompleto'
    };
  }, [depositos, lastResetDate]);

  // Calculate monthly stats - use persisted statistics when available
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = currentMonth.getFullYear() === now.getFullYear() && 
                          currentMonth.getMonth() === now.getMonth();
    
    // Para o mês atual, sempre calcular dinamicamente para garantir dados em tempo real
    if (isCurrentMonth || !monthStatistics) {
      // Cálculo dinâmico em tempo real
      // Filtrar dias considerando apenas a partir da data de início do sistema E após o último reset
      const effectiveStartDate = new Date(Math.max(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime(),
        DEPOSIT_SYSTEM_START_DATE.getTime(),
        lastResetDate ? lastResetDate.getTime() : 0
      ));
      
      const workingDays = diasDoMes.filter(day => 
        day.getDay() !== 0 && // Excluir apenas domingo
        day >= effectiveStartDate // Considerar apenas dias após início do sistema e reset
      );
      
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
    } else if (monthStatistics) {
      // Usar estatísticas persistidas apenas para meses anteriores
      return {
        workingDays: monthStatistics.working_days,
        completeDays: monthStatistics.complete_days,
        missedDays: monthStatistics.missed_days,
        completion: Math.round(monthStatistics.completion_rate)
      };
    }
    
    // Fallback
    return {
      workingDays: 0,
      completeDays: 0,
      missedDays: 0,
      completion: 0
    };
  }, [monthStatistics, diasDoMes, currentMonth, lastResetDate, getDayStatus]);

  const stats = monthlyStats;

  return (
    <Card className="w-full border shadow-soft">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold">
                Calendário de Depósitos
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Acompanhamento diário dos depósitos bancários
              </CardDescription>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="font-medium min-w-[120px] sm:min-w-[140px] text-center text-xs sm:text-sm px-2">
                {format(currentMonth, isMobile ? "MMM yyyy" : "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextMonth}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {handleRefreshStatistics && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshStatistics}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-9 ml-2"
                  title="Recalcular estatísticas"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg sm:text-lg font-bold text-primary">{stats.completion}%</div>
              <div className="text-xs sm:text-xs text-muted-foreground">Taxa de conclusão</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-lg font-bold text-green-600 dark:text-green-400">{stats.completeDays}</div>
              <div className="text-xs sm:text-xs text-muted-foreground">Dias completos</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-lg font-bold text-red-600 dark:text-red-400">{stats.missedDays}</div>
              <div className="text-xs sm:text-xs text-muted-foreground">Dias perdidos</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-lg font-bold text-primary">{stats.workingDays}</div>
              <div className="text-xs sm:text-xs text-muted-foreground">Dias úteis</div>
            </div>
          </div>

          {/* Legend - Responsiva */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 text-xs sm:text-xs px-2 sm:px-2 py-1">
              <CheckCircle className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
              <span className="hidden sm:inline">Completo</span>
              <span className="sm:hidden">OK</span>
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800 text-xs sm:text-xs px-2 sm:px-2 py-1">
              <AlertTriangle className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
              <span className="hidden md:inline">Pendente Tesouraria</span>
              <span className="md:hidden">Pendente</span>
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 text-xs sm:text-xs px-2 sm:px-2 py-1">
              <XCircle className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
              <span className="hidden sm:inline">Atraso</span>
              <span className="sm:hidden">Atraso</span>
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border text-xs sm:text-xs px-2 sm:px-2 py-1">
              <span className="hidden sm:inline">Domingo</span>
              <span className="sm:hidden">Domingo</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-1 py-2 sm:px-4 sm:py-4">
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Header dos dias da semana */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
            <div key={day} className={`text-center font-medium p-2 sm:p-2 text-xs sm:text-xs ${
              index === 0 || index === 6 ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {isMobile ? day.substring(0, 3) : day}
            </div>
          ))}
          
          {/* Espaços vazios antes do primeiro dia do mês */}
          {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="p-0.5 sm:p-1"></div>
          ))}
          
          {/* Dias do mês */}
          {diasDoMes.map((day) => {
            const dayStatus = getDayStatus(day);
            const depositosForDay = depositos.filter(deposito => isSameDay(deposito.data, day));
            const isToday = isSameDay(day, new Date());
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
                  relative p-0.5 sm:p-1 h-12 sm:h-16 md:h-20 border border-border rounded-md sm:rounded-lg 
                  flex flex-col items-center justify-center
                  transition-all duration-200 group active:scale-95
                  ${dayStatus.color}
                  ${isToday ? 'ring-1 sm:ring-2 ring-primary ring-offset-1' : ''}
                  hover:scale-105 hover:z-10
                `}
                title={dayStatus.label}
              >
                {/* Número do dia */}
                <div className="font-semibold text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1">
                  {day.getDate()}
                </div>
                
                {/* Status e informações */}
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  {StatusIcon && (
                    <StatusIcon className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                  )}
                  
                  {depositosForDay.length > 1 && (
                    <span className="text-[8px] sm:text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                      {depositosForDay.length}
                    </span>
                  )}
                </div>
                
                {/* Horário do depósito - apenas em telas maiores */}
                {earliestDeposit && !isMobile && (
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] opacity-70 mt-0.5">
                    {format(earliestDeposit.data, "HH:mm")}
                  </div>
                )}
                
                {/* Indicador de hoje */}
                {isToday && (
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
