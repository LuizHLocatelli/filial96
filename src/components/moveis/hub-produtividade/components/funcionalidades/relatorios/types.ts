
export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityTrend: 'up' | 'down' | 'stable';
  weeklyGoal: number;
  monthlyGoal: number;
  efficiency: number;
}

export interface CategoryStats {
  name: string;
  total: number;
  completed: number;
  completionRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface WeeklyData {
  week: string;
  rotinas: number;
  orientacoes: number;
  tarefas: number;
  total: number;
  completed: number;
}
