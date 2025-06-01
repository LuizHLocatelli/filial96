import { useState, useEffect } from "react";
import { format, isSameDay, differenceInSeconds, setHours, setMinutes, setSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertTriangle, XCircle, Calendar, TrendingUp } from "lucide-react";
import type { Deposito } from "@/hooks/crediario/useDepositos";

interface DailyStatusWidgetProps {
  depositos: Deposito[];
}

export function DailyStatusWidget({ depositos }: DailyStatusWidgetProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const today = new Date();
  const isWeekend = today.getDay() === 0; // Apenas domingo (0) é não obrigatório
  
  // Depósitos de hoje
  const todayDeposits = depositos.filter(deposito => 
    isSameDay(deposito.data, today)
  );
  
  // Status do dia
  const hasDeposit = todayDeposits.length > 0;
  const hasReceipt = todayDeposits.some(d => d.comprovante);
  const isIncludedInSystem = todayDeposits.some(d => d.ja_incluido);
  
  // Calcular streak de dias consecutivos
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1); // Começar ontem
    
    while (streak < 30) { // Limitar a 30 dias para performance
      if (currentDate.getDay() === 0) { // Apenas domingo não é obrigatório
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      
      const hasDepositForDay = depositos.some(d => 
        isSameDay(d.data, currentDate) && d.concluido
      );
      
      if (!hasDepositForDay) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Atualizar contador regressivo
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const deadline = setSeconds(setMinutes(setHours(new Date(), 12), 0), 0);
      
      if (now > deadline) {
        setIsExpired(true);
        setTimeRemaining("Prazo expirado");
        return;
      }
      
      const secondsLeft = differenceInSeconds(deadline, now);
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setIsUrgent(secondsLeft <= 1800); // 30 minutos
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Determinar status geral
  const getOverallStatus = () => {
    if (isWeekend) {
      return {
        status: "weekend",
        label: "Domingo",
        color: "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border",
        icon: Calendar
      };
    }
    
    if (isExpired && !hasDeposit) {
      return {
        status: "missed",
        label: "Prazo Perdido",
        color: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
        icon: XCircle
      };
    }
    
    if (hasDeposit && hasReceipt && isIncludedInSystem) {
      return {
        status: "complete",
        label: "Completo",
        color: "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
        icon: CheckCircle2
      };
    }
    
    if (hasDeposit && hasReceipt && !isIncludedInSystem) {
      return {
        status: "partial",
        label: "Pendente Tesouraria",
        color: "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800",
        icon: AlertTriangle
      };
    }
    
    if (isUrgent) {
      return {
        status: "urgent",
        label: "Urgente",
        color: "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
        icon: AlertTriangle
      };
    }
    
    return {
      status: "pending",
      label: "Pendente",
      color: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
      icon: Clock
    };
  };

  const statusInfo = getOverallStatus();
  const StatusIcon = statusInfo.icon;

  // Calcular progresso das tarefas
  const taskProgress = () => {
    if (isWeekend) return 100;
    
    let completed = 0;
    if (hasReceipt) completed += 50;
    if (isIncludedInSystem) completed += 50;
    
    return completed;
  };

  const progress = taskProgress();

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3 sm:pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3">
            <StatusIcon className="h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0" />
            <span>Status do Dia</span>
          </CardTitle>
          <Badge className={`${statusInfo.color} text-xs sm:text-xs px-2 sm:px-2 py-1 font-medium`}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-4 px-4 sm:px-6">
        {/* Contador Regressivo */}
        {!isWeekend && (
          <div className="text-center p-4 sm:p-4 bg-muted/50 rounded-lg">
            <div className="text-sm sm:text-sm text-muted-foreground mb-2">
              Tempo até o prazo (12:00)
            </div>
            <div className={`text-xl sm:text-2xl font-mono font-bold ${
              isExpired ? "text-red-600 dark:text-red-400" : 
              isUrgent ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"
            }`}>
              {timeRemaining}
            </div>
          </div>
        )}

        {/* Progresso das Tarefas */}
        {!isWeekend && (
          <div>
            <div className="flex justify-between text-sm sm:text-sm mb-3">
              <span>Progresso das Tarefas</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm sm:text-sm">
                <div className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${hasReceipt ? 'bg-green-500 dark:bg-green-400' : 'bg-muted dark:bg-muted'}`}></div>
                <span className={`${hasReceipt ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'} flex-1`}>
                  Comprovante anexado
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-sm">
                <div className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${isIncludedInSystem ? 'bg-green-500 dark:bg-green-400' : 'bg-muted dark:bg-muted'}`}></div>
                <span className={`${isIncludedInSystem ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'} flex-1 leading-relaxed`}>
                  Incluído na Tesouraria/P2K
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Streak de dias consecutivos */}
        {streak > 0 && (
          <div className="flex items-center justify-between p-3 sm:p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                  Sequência de {streak} dia{streak > 1 ? 's' : ''}
                </div>
                <div className="text-xs sm:text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {streak >= 7 ? '🔥 Em chamas!' : 'Continue assim!'}
                </div>
              </div>
            </div>
            <div className="text-xl sm:text-xl font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
              {streak}
            </div>
          </div>
        )}

        {/* Status específico para fins de semana */}
        {isWeekend && (
          <div className="text-center p-4 sm:p-4 bg-muted rounded-lg">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
            <div className="text-base sm:text-base font-medium text-muted-foreground">
              Domingo - Descanso
            </div>
            <div className="text-sm sm:text-sm text-muted-foreground mt-2">
              Não há necessidade de depósito hoje
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 