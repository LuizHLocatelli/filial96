import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  FileText,
  Download,
  Zap
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatoriosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotinas: Array<any>;
  orientacoes: Array<any>;
  tarefas: Array<any>;
  stats: any;
  inline?: boolean; // Nova prop para modo inline
}

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityTrend: 'up' | 'down' | 'stable';
  weeklyGoal: number;
  monthlyGoal: number;
  efficiency: number;
}

interface CategoryStats {
  name: string;
  total: number;
  completed: number;
  completionRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface WeeklyData {
  week: string;
  rotinas: number;
  orientacoes: number;
  tarefas: number;
  total: number;
  completed: number;
}

export function Relatorios({ 
  open, 
  onOpenChange, 
  rotinas, 
  orientacoes, 
  tarefas,
  stats,
  inline = false
}: RelatoriosProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('completion');

  // Métricas de produtividade
  const productivityMetrics = useMemo((): ProductivityMetrics => {
    const totalTasks = rotinas.length + tarefas.length;
    const completedTasks = rotinas.filter(r => r.status === 'concluida').length + 
                          tarefas.filter(t => t.status === 'concluida').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Simular dados históricos para tendência
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

  // Estatísticas por categoria
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

  // Dados semanais
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

  // Exportar relatório
  const exportReport = () => {
    const reportData = {
      dataGeracao: new Date().toISOString(),
      periodo: selectedPeriod,
      metricas: productivityMetrics,
      categorias: categoryStats,
      dadosSemanais: weeklyData,
      resumoGeral: {
        totalRotinas: rotinas.length,
        totalOrientacoes: orientacoes.length,
        totalTarefas: tarefas.length,
        stats
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-produtividade-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Zap className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  // Conteúdo principal dos relatórios
  const RelatoriosContent = () => (
    <div className="space-y-6">
      {/* Controles de Filtro */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completion">Taxa de Conclusão</SelectItem>
              <SelectItem value="volume">Volume de Atividades</SelectItem>
              <SelectItem value="efficiency">Eficiência</SelectItem>
              <SelectItem value="trends">Tendências</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportReport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{productivityMetrics.totalTasks}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conclusão</p>
                  <p className="text-xl font-bold">{productivityMetrics.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-xl font-bold">{productivityMetrics.averageCompletionTime}h</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência</p>
                  <p className="text-xl font-bold">{productivityMetrics.efficiency.toFixed(0)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráfico Semanal Simples */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Atividades por Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyData.slice(-4).map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Semana {week.week}</span>
                      <span className="font-medium">{week.total} atividades</span>
                    </div>
                    <Progress value={(week.total / Math.max(...weeklyData.map(w => w.total))) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produtividade */}
        <TabsContent value="productivity" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Metas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Meta Semanal</span>
                    <span className="text-sm text-muted-foreground">
                      {productivityMetrics.completedTasks}/{productivityMetrics.weeklyGoal}
                    </span>
                  </div>
                  <Progress 
                    value={(productivityMetrics.completedTasks / productivityMetrics.weeklyGoal) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Meta Mensal</span>
                    <span className="text-sm text-muted-foreground">
                      {productivityMetrics.completedTasks}/{productivityMetrics.monthlyGoal}
                    </span>
                  </div>
                  <Progress 
                    value={(productivityMetrics.completedTasks / productivityMetrics.monthlyGoal) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Concluídas</span>
                  <Badge variant="default">{productivityMetrics.completedTasks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pendentes</span>
                  <Badge variant="secondary">
                    {productivityMetrics.totalTasks - productivityMetrics.completedTasks}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Atrasadas</span>
                  <Badge variant="destructive">
                    {stats.rotinas?.atrasadas || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categorias */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((category, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{category.name}</h4>
                  {getTrendIcon(category.trend)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total: {category.total}</span>
                    <span>Concluídas: {category.completed}</span>
                  </div>
                  <Progress value={category.completionRate} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {category.completionRate.toFixed(1)}% de conclusão
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {categoryStats.length === 0 && (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sem dados por categoria</h3>
              <p className="text-muted-foreground">
                Adicione categorias às suas atividades para ver análises detalhadas.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">+12%</div>
              <div className="text-sm text-muted-foreground">Crescimento mensal</div>
            </Card>

            <Card className="p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">18</div>
              <div className="text-sm text-muted-foreground">Dias produtivos</div>
            </Card>

            <Card className="p-4 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-muted-foreground">Precisão nas metas</div>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">Excelente performance</div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Sua taxa de conclusão está acima da média.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Oportunidade</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Considere dividir tarefas grandes em subtarefas menores.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950/20 dark:border-orange-800">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800 dark:text-orange-200">Atenção necessária</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Algumas rotinas estão atrasadas. Revise prazos e prioridades.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Se for inline, retorna apenas o conteúdo
  if (inline) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Relatórios e Análises</h2>
          </div>
          <p className="text-muted-foreground">
            Análises detalhadas de produtividade e performance
          </p>
        </div>
        <RelatoriosContent />
      </div>
    );
  }

  // Modo dialog original
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatórios e Análises
          </DialogTitle>
          <DialogDescription>
            Análises detalhadas de produtividade e performance
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <RelatoriosContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
