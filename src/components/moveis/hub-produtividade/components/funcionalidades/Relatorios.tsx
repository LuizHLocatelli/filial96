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
  stats 
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatórios e Análises
          </DialogTitle>
          <DialogDescription>
            Análises detalhadas de produtividade e performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controles de Filtro */}
          <div className="flex items-center justify-between">
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

            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="productivity">Produtividade</TabsTrigger>
              <TabsTrigger value="categories">Por Categoria</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{productivityMetrics.totalTasks}</div>
                    <p className="text-xs text-muted-foreground">
                      {productivityMetrics.completedTasks} concluídas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {productivityMetrics.completionRate.toFixed(1)}%
                    </div>
                    <div className="flex items-center pt-1">
                      {getTrendIcon(productivityMetrics.productivityTrend)}
                      <span className={`text-xs ml-1 ${getTrendColor(productivityMetrics.productivityTrend)}`}>
                        {productivityMetrics.productivityTrend === 'up' ? '+5.2%' : 
                         productivityMetrics.productivityTrend === 'down' ? '-2.1%' : '0.0%'} vs mês anterior
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {productivityMetrics.averageCompletionTime}h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      por atividade
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {productivityMetrics.efficiency.toFixed(0)}%
                    </div>
                    <Progress 
                      value={productivityMetrics.efficiency} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Barras Simples */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades por Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyData.map((week, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Semana {week.week}</span>
                          <span className="font-medium">{week.total} atividades</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Rotinas</div>
                            <Progress value={(week.rotinas / Math.max(1, week.total)) * 100} className="h-2" />
                            <div className="text-xs">{week.rotinas}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Orientações</div>
                            <Progress value={(week.orientacoes / Math.max(1, week.total)) * 100} className="h-2" />
                            <div className="text-xs">{week.orientacoes}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Tarefas</div>
                            <Progress value={(week.tarefas / Math.max(1, week.total)) * 100} className="h-2" />
                            <div className="text-xs">{week.tarefas}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Produtividade */}
            <TabsContent value="productivity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Metas de Produtividade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Meta Semanal</span>
                        <span className="text-sm text-muted-foreground">
                          {productivityMetrics.completedTasks}/{productivityMetrics.weeklyGoal}
                        </span>
                      </div>
                      <Progress 
                        value={(productivityMetrics.completedTasks / productivityMetrics.weeklyGoal) * 100} 
                        className="h-3"
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
                        className="h-3"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Você está {productivityMetrics.completedTasks >= productivityMetrics.weeklyGoal ? 
                          'acima' : 'abaixo'} da meta semanal
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Concluídas</span>
                          <Badge variant="default">{productivityMetrics.completedTasks}</Badge>
                        </div>
                        <Progress 
                          value={productivityMetrics.completionRate} 
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pendentes</span>
                          <Badge variant="secondary">
                            {productivityMetrics.totalTasks - productivityMetrics.completedTasks}
                          </Badge>
                        </div>
                        <Progress 
                          value={100 - productivityMetrics.completionRate} 
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Atrasadas</span>
                          <Badge variant="destructive">
                            {stats.rotinas?.atrasadas || 0}
                          </Badge>
                        </div>
                        <Progress 
                          value={(stats.rotinas?.atrasadas || 0) / Math.max(1, productivityMetrics.totalTasks) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Por Categoria */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryStats.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        {category.name}
                        {getTrendIcon(category.trend)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total</span>
                          <Badge variant="outline">{category.total}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Concluídas</span>
                          <Badge variant="default">{category.completed}</Badge>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Taxa de Conclusão</span>
                            <span className="text-sm font-medium">
                              {category.completionRate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={category.completionRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {categoryStats.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sem dados por categoria</h3>
                    <p className="text-muted-foreground">
                      Adicione categorias às suas atividades para ver análises detalhadas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tendências */}
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tendências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">+12%</div>
                        <div className="text-sm text-muted-foreground">Crescimento mensal</div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">18</div>
                        <div className="text-sm text-muted-foreground">Dias produtivos este mês</div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Target className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">87%</div>
                        <div className="text-sm text-muted-foreground">Precisão nas metas</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Insights e Recomendações</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-green-800">Excelente performance</div>
                            <div className="text-sm text-green-700">
                              Sua taxa de conclusão está 15% acima da média. Continue assim!
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-blue-800">Oportunidade de melhoria</div>
                            <div className="text-sm text-blue-700">
                              Considere dividir tarefas grandes em subtarefas menores para aumentar a produtividade.
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-orange-800">Atenção necessária</div>
                            <div className="text-sm text-orange-700">
                              Algumas rotinas estão atrasadas. Revise seus prazos e prioridades.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 