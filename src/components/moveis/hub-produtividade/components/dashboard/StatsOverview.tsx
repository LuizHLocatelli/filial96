import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  FileText, 
  List, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Target,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { ProductivityStats } from '../../types';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';
import { ModernStatsCard, MetricCard, ProgressCard } from '../visual/ModernCards';
import { AnimatedContainer, AnimatedSkeleton } from '../visual/AnimationComponents';
import { StatsGrid } from '../mobile/ResponsiveGrid';

interface StatsOverviewProps {
  stats: ProductivityStats;
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatsGrid>
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6">
              <AnimatedSkeleton lines={3} />
            </Card>
          ))}
        </StatsGrid>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="p-6">
              <AnimatedSkeleton lines={4} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calcular métricas consolidadas
  const totalItems = stats.rotinas.total + stats.orientacoes.total + stats.tarefas.total;
  const totalConcluidas = stats.rotinas.concluidas + stats.tarefas.concluidas;
  const totalPendentes = stats.rotinas.pendentes + stats.tarefas.pendentes;
  const totalAtrasadas = stats.rotinas.atrasadas + stats.tarefas.atrasadas;
  
  const overallProgress = totalItems > 0 ? Math.round((totalConcluidas / totalItems) * 100) : 0;
  const productivityScore = Math.round((overallProgress + (100 - (totalAtrasadas / totalItems * 100))) / 2);

  // Cards principais de estatísticas
  const mainStatsCards = [
    {
      id: 'rotinas',
      title: 'Rotinas',
      value: stats.rotinas.total,
      description: `${stats.rotinas.concluidas} concluídas de ${stats.rotinas.total}`,
      icon: CheckSquare,
      color: 'green' as const,
      trend: stats.rotinas.total > 0 ? {
        value: stats.rotinas.percentualConclusao,
        isPositive: stats.rotinas.percentualConclusao >= 70,
        label: `${stats.rotinas.percentualConclusao}% concluídas`
      } : undefined,
      onClick: () => console.log('Navegar para Rotinas')
    },
    {
      id: 'orientacoes',
      title: 'Orientações',
      value: stats.orientacoes.total,
      description: `${stats.orientacoes.naoLidas} não lidas`,
      icon: FileText,
      color: 'purple' as const,
      trend: stats.orientacoes.naoLidas > 0 ? {
        value: Math.round((stats.orientacoes.naoLidas / stats.orientacoes.total) * 100),
        isPositive: false,
        label: 'Pendentes de leitura'
      } : {
        value: 100,
        isPositive: true,
        label: 'Todas lidas'
      },
      onClick: () => console.log('Navegar para Orientações')
    },
    {
      id: 'tarefas',
      title: 'Tarefas',
      value: stats.tarefas.total,
      description: `${stats.tarefas.concluidas} concluídas de ${stats.tarefas.total}`,
      icon: List,
      color: 'orange' as const,
      trend: stats.tarefas.total > 0 ? {
        value: stats.tarefas.percentualConclusao,
        isPositive: stats.tarefas.percentualConclusao >= 70,
        label: `${stats.tarefas.percentualConclusao}% concluídas`
      } : undefined,
      onClick: () => console.log('Navegar para Tarefas')
    },
    {
      id: 'productivity',
      title: 'Produtividade',
      value: `${productivityScore}%`,
      description: 'Score geral de eficiência',
      icon: Zap,
      color: productivityScore >= 80 ? 'green' : productivityScore >= 60 ? 'blue' : 'red' as const,
      trend: {
        value: productivityScore,
        isPositive: productivityScore >= 70,
        label: productivityScore >= 80 ? 'Excelente' : productivityScore >= 60 ? 'Bom' : 'Precisa melhorar'
      }
    }
  ];

  // Métricas detalhadas
  const detailedMetrics = [
    {
      label: 'Total de Itens',
      value: totalItems,
      subValue: 'no sistema',
      icon: Target,
      color: '#3b82f6'
    },
    {
      label: 'Concluídas',
      value: totalConcluidas,
      subValue: `${Math.round((totalConcluidas / totalItems) * 100)}%`,
      icon: CheckCircle2,
      color: '#10b981',
      trend: {
        value: Math.round((totalConcluidas / totalItems) * 100),
        isPositive: totalConcluidas > totalPendentes
      }
    },
    {
      label: 'Pendentes',
      value: totalPendentes,
      subValue: `${Math.round((totalPendentes / totalItems) * 100)}%`,
      icon: Clock,
      color: '#f59e0b'
    },
    {
      label: 'Atrasadas',
      value: totalAtrasadas,
      subValue: totalAtrasadas > 0 ? 'Atenção!' : 'Nenhuma',
      icon: AlertTriangle,
      color: '#ef4444',
      trend: totalAtrasadas > 0 ? {
        value: Math.round((totalAtrasadas / totalItems) * 100),
        isPositive: false
      } : undefined
    }
  ];

  return (
    <AnimatedContainer className="space-y-6" variant="fadeInUp" stagger={0.1}>
      {/* Cards Principais */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Visão Geral</h2>
          <p className="text-sm text-muted-foreground">
            Resumo da sua produtividade e progresso atual
          </p>
        </div>
        
        <StatsGrid>
          {mainStatsCards.map((card) => (
            <ModernStatsCard
              key={card.id}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
              onClick={card.onClick}
              isLoading={isLoading}
            />
          ))}
        </StatsGrid>
      </div>

      {/* Métricas Detalhadas e Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métricas Compactas */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Métricas Detalhadas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {detailedMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                label={metric.label}
                value={metric.value}
                subValue={metric.subValue}
                icon={metric.icon}
                color={metric.color}
                trend={metric.trend}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Progress Card */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Progresso</h3>
          <ProgressCard
            title="Conclusão Geral"
            description="Acompanhe seu progresso"
            totalProgress={overallProgress}
            icon={Target}
            progress={[
              {
                label: 'Rotinas',
                value: stats.rotinas.concluidas,
                max: stats.rotinas.total,
                color: '#10b981'
              },
              {
                label: 'Tarefas',
                value: stats.tarefas.concluidas,
                max: stats.tarefas.total,
                color: '#f59e0b'
              }
            ]}
            actions={[
              {
                label: 'Ver Detalhes',
                onClick: () => console.log('Ver detalhes')
              }
            ]}
          />
        </div>
      </div>

      {/* Status Cards por Categoria */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Status por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rotinas Detalhadas */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Rotinas</CardTitle>
                  <p className="text-sm text-muted-foreground">Obrigatórias diárias</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Progresso</span>
                <span className="text-sm font-medium">{stats.rotinas.percentualConclusao}%</span>
              </div>
              <Progress value={stats.rotinas.percentualConclusao} className="h-2" />
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">{stats.rotinas.concluidas}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-600">{stats.rotinas.pendentes}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{stats.rotinas.atrasadas}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orientações Detalhadas */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Orientações</CardTitle>
                  <p className="text-sm text-muted-foreground">Documentos e guias</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.orientacoes.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.orientacoes.naoLidas}</p>
                  <p className="text-sm text-muted-foreground">Não lidas</p>
                </div>
              </div>
              
              {stats.orientacoes.recentes > 0 && (
                <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    {stats.orientacoes.recentes} novas orientações esta semana
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarefas Detalhadas */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <List className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Tarefas</CardTitle>
                  <p className="text-sm text-muted-foreground">Gestão de atividades</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Progresso</span>
                <span className="text-sm font-medium">{stats.tarefas.percentualConclusao}%</span>
              </div>
              <Progress value={stats.tarefas.percentualConclusao} className="h-2" />
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">{stats.tarefas.concluidas}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-600">{stats.tarefas.pendentes}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{stats.tarefas.atrasadas}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedContainer>
  );
} 