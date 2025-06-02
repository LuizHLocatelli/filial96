
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  FileText, 
  List, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { ProductivityStats } from '../../types';
import { AnimatedCard, AnimatedProgress } from '../visual/AnimationComponents';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
  stats: ProductivityStats;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  progress?: number;
  badges?: Array<{ label: string; count: number; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }>;
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color, 
  progress,
  badges 
}: StatCardProps) {
  const colorClasses = {
    blue: {
      icon: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      progress: 'bg-blue-500'
    },
    green: {
      icon: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      progress: 'bg-green-500'
    },
    orange: {
      icon: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      progress: 'bg-orange-500'
    },
    purple: {
      icon: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      progress: 'bg-purple-500'
    },
    red: {
      icon: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      progress: 'bg-red-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <AnimatedCard className="h-full">
      <Card className={cn("h-full", classes.bg, classes.border, "border")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn("p-2 rounded-md", classes.bg)}>
            <Icon className={cn("h-4 w-4", classes.icon)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' && (
                <TrendingUp className="h-3 w-3 text-green-600" />
              )}
              {trend.direction === 'down' && (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={cn(
                "text-xs font-medium",
                trend.direction === 'up' && "text-green-600",
                trend.direction === 'down' && "text-red-600",
                trend.direction === 'stable' && "text-muted-foreground"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}

          {/* Progress */}
          {typeof progress === 'number' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <AnimatedProgress 
                value={progress} 
                className="h-1.5"
                color={`hsl(var(--${color}-500))`}
                showPercentage={false}
              />
            </div>
          )}

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'secondary'} className="text-xs">
                  {badge.label}: {badge.count}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}

export function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const rotinasCards = [
    {
      title: 'Rotinas Totais',
      value: stats.rotinas.total,
      subtitle: 'Rotinas cadastradas',
      icon: CheckSquare,
      color: 'blue' as const,
      progress: stats.rotinas.percentualConclusao,
      badges: [
        { label: 'Concluídas', count: stats.rotinas.concluidas, variant: 'default' as const },
        { label: 'Pendentes', count: stats.rotinas.pendentes, variant: 'secondary' as const },
        { label: 'Atrasadas', count: stats.rotinas.atrasadas, variant: 'destructive' as const }
      ]
    }
  ];

  const orientacoesCards = [
    {
      title: 'Orientações',
      value: stats.orientacoes.total,
      subtitle: 'Documentos disponíveis',
      icon: FileText,
      color: 'green' as const,
      badges: [
        { label: 'Não lidas', count: stats.orientacoes.naoLidas, variant: 'destructive' as const },
        { label: 'Recentes', count: stats.orientacoes.recentes, variant: 'secondary' as const }
      ]
    }
  ];

  const tarefasCards = [
    {
      title: 'Tarefas',
      value: stats.tarefas.total,
      subtitle: 'Tarefas em andamento',
      icon: List,
      color: 'purple' as const,
      progress: stats.tarefas.percentualConclusao,
      badges: [
        { label: 'Concluídas', count: stats.tarefas.concluidas, variant: 'default' as const },
        { label: 'Pendentes', count: stats.tarefas.pendentes, variant: 'secondary' as const },
        { label: 'Atrasadas', count: stats.tarefas.atrasadas, variant: 'destructive' as const }
      ]
    }
  ];

  const produtividadeCards = [
    {
      title: 'Produtividade Geral',
      value: `${Math.round((stats.rotinas.percentualConclusao + stats.tarefas.percentualConclusao) / 2)}%`,
      subtitle: 'Média de conclusão',
      icon: Activity,
      color: 'orange' as const,
      trend: {
        value: 12,
        direction: 'up' as const
      }
    }
  ];

  const allCards = [...rotinasCards, ...orientacoesCards, ...tarefasCards, ...produtividadeCards];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visão Geral da Produtividade</h2>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          Atualizado agora
        </Badge>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Resumo Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Resumo do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Rotinas</span>
              </div>
              <p className="text-muted-foreground">
                {stats.rotinas.concluidas} de {stats.rotinas.total} concluídas hoje
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Tarefas</span>
              </div>
              <p className="text-muted-foreground">
                {stats.tarefas.pendentes} tarefas aguardando
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="font-medium">Orientações</span>
              </div>
              <p className="text-muted-foreground">
                {stats.orientacoes.naoLidas} não lidas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
