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
import { useLayoutPreferences } from '../../hooks/useLayoutPreferences';

interface StatsOverviewProps {
  stats: ProductivityStats;
  isLoading?: boolean;
  compact?: boolean;
  overrideLayoutConfig?: boolean;
  onNavigateToSection?: (section: 'dashboard' | 'rotinas' | 'orientacoes' | 'tarefas') => void;
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
  onClick?: () => void;
  section?: 'dashboard' | 'rotinas' | 'orientacoes' | 'tarefas';
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color, 
  progress,
  badges,
  onClick,
  section
}: StatCardProps) {
  const colorClasses = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      border: 'border-blue-200 dark:border-blue-800',
      progress: '#3b82f6' // blue-500
    },
    green: {
      icon: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/50',
      border: 'border-green-200 dark:border-green-800',
      progress: '#22c55e' // green-500
    },
    orange: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
      border: 'border-orange-200 dark:border-orange-800',
      progress: '#f97316' // orange-500
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      border: 'border-purple-200 dark:border-purple-800',
      progress: '#a855f7' // purple-500
    },
    red: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
      border: 'border-red-200 dark:border-red-800',
      progress: '#ef4444' // red-500
    }
  };

  const classes = colorClasses[color];

  return (
    <AnimatedCard className="h-full" onClick={onClick}>
      <Card className={cn(
        "h-full transition-all duration-200", 
        classes.bg, 
        classes.border, 
        "border",
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02] transform"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn("p-1.5 rounded-md", classes.bg)}>
            <Icon className={cn("h-3.5 w-3.5", classes.icon)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <div className="text-xl font-bold">
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
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              )}
              {trend.direction === 'down' && (
                <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span className={cn(
                "text-xs font-medium",
                trend.direction === 'up' && "text-green-600 dark:text-green-400",
                trend.direction === 'down' && "text-red-600 dark:text-red-400",
                trend.direction === 'stable' && "text-muted-foreground"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}

          {/* Progress - Cores melhoradas */}
          {typeof progress === 'number' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <AnimatedProgress 
                value={progress} 
                className="h-1.5"
                color={classes.progress}
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

          {/* Indicador visual de clique */}
          {onClick && (
            <div className="flex items-center justify-center pt-2 opacity-70 hover:opacity-100 transition-opacity">
              <span className="text-xs text-muted-foreground">Clique para acessar →</span>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}

export function StatsOverview({ 
  stats, 
  isLoading = false, 
  compact = false,
  overrideLayoutConfig = false,
  onNavigateToSection
}: StatsOverviewProps) {
  const { 
    preferences, 
    layoutConfig, 
    shouldShowResumoRapido 
  } = useLayoutPreferences();

  // Use preferências do usuário ou props antigas para compatibilidade
  const effectiveCompact = overrideLayoutConfig ? compact : preferences.density === 'compact';
  const effectiveLayoutConfig = overrideLayoutConfig ? 
    (compact ? 
      { spacing: 'space-y-3', statsGrid: 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6' } : 
      { spacing: 'space-y-4', statsGrid: 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6' }
    ) : layoutConfig;

  if (isLoading) {
    return (
      <div className={`grid gap-3 lg:gap-4 ${effectiveLayoutConfig.statsGrid}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
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
      section: 'rotinas' as const,
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
      section: 'orientacoes' as const,
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
      section: 'tarefas' as const,
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
      section: 'dashboard' as const,
      trend: {
        value: 12,
        direction: 'up' as const
      }
    }
  ];

  const allCards = [...rotinasCards, ...orientacoesCards, ...tarefasCards, ...produtividadeCards];

  return (
    <div className={effectiveLayoutConfig.spacing}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "font-semibold",
          effectiveCompact ? "text-base" : layoutConfig.headerSize
        )}>
          Visão Geral da Produtividade
        </h2>
        <Badge variant="outline" className="gap-1">
          <Activity className={layoutConfig.iconSize} />
          Atualizado agora
        </Badge>
      </div>

      {/* Cards Grid - Usa configuração dinâmica */}
      <div className={`grid gap-3 lg:gap-4 ${effectiveLayoutConfig.statsGrid}`}>
        {allCards.map((card, index) => (
          <StatCard 
            key={index} 
            {...card} 
            onClick={onNavigateToSection ? () => onNavigateToSection(card.section) : undefined} 
          />
        ))}
      </div>

      {/* Resumo Rápido - Controlado por preferências */}
      {shouldShowResumoRapido && (
        <Card>
          <CardHeader className={effectiveCompact ? "pb-2" : "pb-3"}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              effectiveCompact ? "text-sm" : layoutConfig.fontSize
            )}>
              <TrendingUp className={cn(
                "text-green-600 dark:text-green-400",
                effectiveCompact ? "h-3.5 w-3.5" : layoutConfig.iconSize
              )} />
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-3 text-sm",
              effectiveCompact ? "gap-2" : "gap-3"
            )}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckSquare className={cn(
                    "text-blue-600 dark:text-blue-400",
                    effectiveCompact ? "h-3.5 w-3.5" : layoutConfig.iconSize
                  )} />
                  <span className="font-medium">Rotinas</span>
                </div>
                <p className={cn(
                  "text-muted-foreground",
                  effectiveCompact ? "text-xs" : layoutConfig.fontSize
                )}>
                  {stats.rotinas.concluidas} de {stats.rotinas.total} concluídas hoje
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <List className={cn(
                    "text-purple-600 dark:text-purple-400",
                    effectiveCompact ? "h-3.5 w-3.5" : layoutConfig.iconSize
                  )} />
                  <span className="font-medium">Tarefas</span>
                </div>
                <p className={cn(
                  "text-muted-foreground",
                  effectiveCompact ? "text-xs" : layoutConfig.fontSize
                )}>
                  {stats.tarefas.pendentes} tarefas aguardando
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className={cn(
                    "text-green-600 dark:text-green-400",
                    effectiveCompact ? "h-3.5 w-3.5" : layoutConfig.iconSize
                  )} />
                  <span className="font-medium">Orientações</span>
                </div>
                <p className={cn(
                  "text-muted-foreground",
                  effectiveCompact ? "text-xs" : layoutConfig.fontSize
                )}>
                  {stats.orientacoes.naoLidas} não lidas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
