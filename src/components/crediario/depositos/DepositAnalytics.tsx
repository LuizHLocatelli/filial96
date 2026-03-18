import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths, differenceInCalendarDays, eachDayOfInterval, getDay, startOfWeek, endOfWeek, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Award, AlertTriangle, CheckCircle } from "@/components/ui/emoji-icons";
import type { Deposito, DepositoStatistics } from "@/hooks/crediario/useDepositos";
import { DEPOSIT_SYSTEM_START_DATE } from "@/lib/constants";

interface DepositAnalyticsProps {
  depositos: Deposito[];
  currentMonth: Date;
  monthStatistics?: DepositoStatistics | null;
}

export function DepositAnalytics({ depositos, currentMonth, monthStatistics }: DepositAnalyticsProps) {
  
  const analytics = useMemo(() => {
    const today = new Date();
    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthEnd = endOfMonth(currentMonth);
    const lastMonth = subMonths(currentMonth, 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);

    // Use persisted statistics for current month if available and recent
    let currentMonthStats;
    const now = new Date();
    const isCurrentMonth = currentMonth.getFullYear() === now.getFullYear() && 
                          currentMonth.getMonth() === now.getMonth();
    
    // Para o mês atual, sempre calcular dinamicamente para garantir dados em tempo real
    if (isCurrentMonth || !monthStatistics) {
      // Cálculo dinâmico em tempo real
      const currentMonthDeposits = depositos.filter(d => 
        d.data >= currentMonthStart && d.data <= currentMonthEnd
      );
      
      // Calcular dias úteis considerando apenas a partir da data de início do sistema
      const effectiveStartDate = currentMonthStart > DEPOSIT_SYSTEM_START_DATE ? currentMonthStart : DEPOSIT_SYSTEM_START_DATE;
      
      const workingDaysCurrentMonth = eachDayOfInterval({
        start: effectiveStartDate, // Usar data efetiva (após início do sistema)
        end: currentMonthEnd
      }).filter(day => day.getDay() !== 0).length;

      const currentMonthComplete = currentMonthDeposits.filter(d => 
        d.comprovante && d.ja_incluido
      ).length;

      const currentMonthPartial = currentMonthDeposits.filter(d => 
        d.comprovante && !d.ja_incluido
      ).length;

      // Calcular dias perdidos corretamente: apenas dias passados sem nenhum depósito
      const workingDaysPassed = eachDayOfInterval({
        start: effectiveStartDate,
        end: currentMonthEnd
      }).filter(day => 
        day.getDay() !== 0 && // Não é domingo
        day <= today // Apenas dias passados (incluindo hoje)
      );
      
      const currentMonthMissed = workingDaysPassed.filter(day => {
        // Verificar se não existe nenhum depósito para este dia
        const hasAnyDeposit = currentMonthDeposits.some(d => 
          d.data.toDateString() === day.toDateString()
        );
        return !hasAnyDeposit;
      }).length;

      const currentCompletionRate = workingDaysCurrentMonth > 0 ? 
        Math.round((currentMonthComplete / workingDaysCurrentMonth) * 100) : 0;

      currentMonthStats = {
        complete: currentMonthComplete,
        partial: currentMonthPartial,
        missed: currentMonthMissed,
        total: workingDaysCurrentMonth,
        completionRate: currentCompletionRate
      };
    } else if (monthStatistics) {
      // Usar estatísticas persistidas apenas para meses anteriores
      currentMonthStats = {
        complete: monthStatistics.complete_days,
        partial: monthStatistics.partial_days,
        missed: monthStatistics.missed_days,
        total: monthStatistics.working_days,
        completionRate: Math.round(monthStatistics.completion_rate)
      };
    }

    // Filtrar depósitos por períodos
    const currentMonthDeposits = depositos.filter(d => 
      d.data >= currentMonthStart && d.data <= currentMonthEnd
    );
    
    const lastMonthDeposits = depositos.filter(d => 
      d.data >= lastMonthStart && d.data <= lastMonthEnd
    );

    // Dias úteis (seg-sáb) - apenas domingo não é obrigatório
    const workingDaysCurrentMonth = eachDayOfInterval({
      start: currentMonthStart,
      end: currentMonthEnd
    }).filter(day => day.getDay() !== 0).length; // Excluir apenas domingo

    const workingDaysLastMonth = eachDayOfInterval({
      start: lastMonthStart,
      end: lastMonthEnd
    }).filter(day => day.getDay() !== 0).length; // Excluir apenas domingo

    // Calcular métricas do mês anterior
    const lastMonthComplete = lastMonthDeposits.filter(d => 
      d.comprovante && d.ja_incluido
    ).length;

    // Taxas de cumprimento
    const lastCompletionRate = workingDaysLastMonth > 0 ? 
      Math.round((lastMonthComplete / workingDaysLastMonth) * 100) : 0;

    const completionTrend = currentMonthStats.completionRate - lastCompletionRate;

    // Tempo médio de depósito
    const depositsWithTime = currentMonthDeposits.filter(d => d.data);
    const averageHour = depositsWithTime.length > 0 ? 
      Math.round(depositsWithTime.reduce((sum, d) => sum + getHours(d.data), 0) / depositsWithTime.length) : 0;

    // Streak atual (dias consecutivos)
    const calculateCurrentStreak = () => {
      let streak = 0;
      const checkDate = new Date(today);
      
      // Se hoje é domingo, começar no sábado
      while (checkDate.getDay() === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (streak < 30) { // Limite de 30 dias
        if (checkDate.getDay() === 0) { // Apenas domingo não é obrigatório
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }

        const hasDeposit = depositos.some(d => 
          d.data.toDateString() === checkDate.toDateString() && 
          d.comprovante && d.ja_incluido
        );

        if (!hasDeposit) break;

        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      return streak;
    };

    const currentStreak = calculateCurrentStreak();

    // Análise de horários (distribuição por período do dia)
    const timeDistribution = {
      morning: depositsWithTime.filter(d => getHours(d.data) < 10).length, // Antes das 10h
      midMorning: depositsWithTime.filter(d => getHours(d.data) >= 10 && getHours(d.data) < 12).length, // 10h-12h
      afternoon: depositsWithTime.filter(d => getHours(d.data) >= 12).length, // Após 12h (perdeu prazo)
    };

    // Dia da semana mais problemático
    const weekdayIssues = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 // seg-sáb
    };

    eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd })
      .filter(day => day.getDay() !== 0) // Excluir apenas domingo
      .forEach(day => {
        const dayOfWeek = getDay(day);
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          const hasCompleteDeposit = depositos.some(d =>
            d.data.toDateString() === day.toDateString() && 
            d.comprovante && d.ja_incluido
          );
          if (!hasCompleteDeposit) {
            weekdayIssues[dayOfWeek as keyof typeof weekdayIssues]++;
          }
        }
      });

    const mostProblematicDay = Object.entries(weekdayIssues).reduce((a, b) => 
      weekdayIssues[parseInt(a[0]) as keyof typeof weekdayIssues] > weekdayIssues[parseInt(b[0]) as keyof typeof weekdayIssues] ? a : b
    )[0];

    const dayNames = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return {
      currentMonth: currentMonthStats,
      trends: {
        completionTrend,
        isImproving: completionTrend > 0
      },
      performance: {
        currentStreak,
        averageHour,
        timeDistribution,
        mostProblematicDay: dayNames[parseInt(mostProblematicDay)]
      }
    };
  }, [depositos, currentMonth, monthStatistics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Taxa de Cumprimento */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Taxa de Cumprimento
          </CardTitle>
          <CardDescription>
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{analytics.currentMonth.completionRate}%</span>
              <Badge variant={analytics.trends.isImproving ? "default" : "destructive"} className="flex items-center gap-1">
                {analytics.trends.isImproving ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(analytics.trends.completionTrend)}%
              </Badge>
            </div>
            <Progress value={analytics.currentMonth.completionRate} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {analytics.currentMonth.complete} de {analytics.currentMonth.total} dias completos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Atual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            Dias Consecutivos
          </CardTitle>
          <CardDescription>
            Sequência atual de sucesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">{analytics.performance.currentStreak}</span>
              <p className="text-sm text-muted-foreground">dias seguidos</p>
            </div>
            {analytics.performance.currentStreak >= 5 && (
              <Badge variant="default" className="w-full justify-center">
                🔥 Em chamas! Continue assim!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horário Médio */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horário Médio
          </CardTitle>
          <CardDescription>
            Quando você costuma depositar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-2xl font-bold">
                {analytics.performance.averageHour.toString().padStart(2, '0')}:00
              </span>
              <p className="text-sm text-muted-foreground">horário médio</p>
            </div>
            <div className="flex justify-center">
              <Badge variant={analytics.performance.averageHour < 11 ? "default" : "destructive"}>
                {analytics.performance.averageHour < 11 ? "Pontual" : "Atrasado"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Horários */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Distribuição de Horários
          </CardTitle>
          <CardDescription>
            Quando você faz os depósitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Manhã (até 10h)</span>
                <span className="text-green-600 font-medium">{analytics.performance.timeDistribution.morning}</span>
              </div>
              <Progress 
                value={(analytics.performance.timeDistribution.morning / Math.max(depositos.length, 1)) * 100} 
                className="h-2 bg-green-100" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meio da manhã (10h-12h)</span>
                <span className="text-yellow-600 font-medium">{analytics.performance.timeDistribution.midMorning}</span>
              </div>
              <Progress 
                value={(analytics.performance.timeDistribution.midMorning / Math.max(depositos.length, 1)) * 100} 
                className="h-2 bg-yellow-100" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tarde (após 12h)</span>
                <span className="text-red-600 font-medium">{analytics.performance.timeDistribution.afternoon}</span>
              </div>
              <Progress 
                value={(analytics.performance.timeDistribution.afternoon / Math.max(depositos.length, 1)) * 100} 
                className="h-2 bg-red-100" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do Mês */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status do Mês
          </CardTitle>
          <CardDescription>
            Resumo de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Completos</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {analytics.currentMonth.complete}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-yellow-700">Parciais</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                {analytics.currentMonth.partial}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Perdidos</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                {analytics.currentMonth.missed}
              </Badge>
            </div>

            {analytics.performance.mostProblematicDay && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">Dia mais problemático:</div>
                <div className="text-sm font-medium">{analytics.performance.mostProblematicDay}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 