
import { useMemo } from 'react';
import { format, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProductivityMetrics, CategoryStats, WeeklyData } from './types';

interface RelatoriosDataProps {
  rotinas: Array<any>;
  orientacoes: Array<any>;
  tarefas: Array<any>;
}

export function useRelatoriosData({ rotinas, orientacoes, tarefas }: RelatoriosDataProps) {
  const productivityMetrics = useMemo((): ProductivityMetrics => {
    const totalTasks = rotinas.length + tarefas.length;
    const completedTasks = rotinas.filter(r => r.status === 'concluida').length + 
                          tarefas.filter(t => t.status === 'concluida').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const lastMonthRate = Math.max(0, completionRate + (Math.random() - 0.5) * 20);
    const trend: 'up' | 'down' | 'stable' = 
      completionRate > lastMonthRate + 5 ? 'up' :
      completionRate < lastMonthRate - 5 ? 'down' : 'stable';

    return {
      totalTasks,
      completedTasks,
      completionRate,
      averageCompletionTime: 2.5, // Simulado em horas
      productivityTrend: trend,
      weeklyGoal: 25,
      monthlyGoal: 100,
      efficiency: Math.min(100, completionRate * 1.2)
    };
  }, [rotinas, tarefas]);

  const categoryStats = useMemo((): CategoryStats[] => {
    const categories = new Map<string, { total: number; completed: number }>();
    
    [...rotinas, ...tarefas].forEach(item => {
      const category = item.categoria || 'Sem categoria';
      const current = categories.get(category) || { total: 0, completed: 0 };
      current.total++;
      if (item.status === 'concluida') current.completed++;
      categories.set(category, current);
    });

    return Array.from(categories.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      completed: data.completed,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      trend: (Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
    })).sort((a, b) => b.total - a.total);
  }, [rotinas, tarefas]);

  const weeklyData = useMemo((): WeeklyData[] => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekRotinas = rotinas.filter(r => {
        const itemDate = new Date(r.created_at);
        return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
      });

      const weekOrientacoes = orientacoes.filter(o => {
        const itemDate = new Date(o.created_at);
        return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
      });

      const weekTarefas = tarefas.filter(t => {
        const itemDate = new Date(t.created_at);
        return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
      });

      const totalWeek = weekRotinas.length + weekOrientacoes.length + weekTarefas.length;
      const completedWeek = weekRotinas.filter(r => r.status === 'concluida').length +
                           weekTarefas.filter(t => t.status === 'concluida').length;

      weeks.push({
        week: format(weekStart, 'dd/MM', { locale: ptBR }),
        rotinas: weekRotinas.length,
        orientacoes: weekOrientacoes.length,
        tarefas: weekTarefas.length,
        total: totalWeek,
        completed: completedWeek
      });
    }

    return weeks;
  }, [rotinas, orientacoes, tarefas]);

  return { productivityMetrics, categoryStats, weeklyData };
}
