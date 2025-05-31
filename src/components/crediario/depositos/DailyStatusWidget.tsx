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
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: Calendar
      };
    }
    
    if (isExpired && !hasDeposit) {
      return {
        status: "missed",
        label: "Prazo Perdido",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle
      };
    }
    
    if (hasDeposit && hasReceipt && isIncludedInSystem) {
      return {
        status: "complete",
        label: "Completo",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle2
      };
    }
    
    if (hasDeposit && hasReceipt && !isIncludedInSystem) {
      return {
        status: "partial",
        label: "Pendente Sistema",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: AlertTriangle
      };
    }
    
    if (isUrgent) {
      return {
        status: "urgent",
        label: "Urgente",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: AlertTriangle
      };
    }
    
    return {
      status: "pending",
      label: "Pendente",
      color: "bg-blue-100 text-blue-700 border-blue-300",
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Status do Dia
          </CardTitle>
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contador Regressivo */}
        {!isWeekend && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Tempo até o prazo (12:00)
            </div>
            <div className={`text-2xl font-mono font-bold ${
              isExpired ? "text-red-600" : 
              isUrgent ? "text-orange-600" : "text-green-600"
            }`}>
              {timeRemaining}
            </div>
          </div>
        )}

        {/* Progresso das Tarefas */}
        {!isWeekend && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso das Tarefas</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${hasReceipt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={hasReceipt ? 'text-green-700' : 'text-gray-500'}>
                  Comprovante anexado
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${isIncludedInSystem ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={isIncludedInSystem ? 'text-green-700' : 'text-gray-500'}>
                  Incluído no sistema
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{streak}</div>
            <div className="text-xs text-muted-foreground">Dias consecutivos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{todayDeposits.length}</div>
            <div className="text-xs text-muted-foreground">Depósitos hoje</div>
          </div>
        </div>

        {/* Data atual */}
        <div className="text-center text-sm text-muted-foreground pt-2 border-t">
          {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </CardContent>
    </Card>
  );
} 