import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  MoreHorizontal,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCard, AnimatedProgress } from './AnimationComponents';
import { useTheme } from './ThemeProvider';

// Stats Card moderno com gradientes
interface ModernStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isLoading?: boolean;
  onClick?: () => void;
}

export function ModernStatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  isLoading = false,
  onClick
}: ModernStatsCardProps) {
  const { config } = useTheme();

  const colorVariants = {
    blue: {
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/50 dark:border-blue-800/50'
    },
    green: {
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      border: 'border-green-200/50 dark:border-green-800/50'
    },
    purple: {
      gradient: 'from-purple-500/10 to-violet-500/10',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/50 dark:border-purple-800/50'
    },
    orange: {
      gradient: 'from-orange-500/10 to-yellow-500/10',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200/50 dark:border-orange-800/50'
    },
    red: {
      gradient: 'from-red-500/10 to-pink-500/10',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
      border: 'border-red-200/50 dark:border-red-800/50'
    }
  };

  const variant = colorVariants[color];

  return (
    <AnimatedCard
      onClick={onClick}
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br", variant.gradient,
        "border", variant.border,
        "backdrop-blur-sm",
        onClick && "cursor-pointer hover:shadow-lg"
      )}
      hoverScale={1.02}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-white/10 rounded-full -translate-y-16 translate-x-16" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", variant.iconBg)}>
            <Icon className={cn("h-5 w-5", variant.iconColor)} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {trend?.label && (
            <p className="text-xs text-muted-foreground">
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

// Activity Card com timeline
interface ActivityCardProps {
  title: string;
  description: string;
  timestamp: string;
  type: 'rotina' | 'orientacao' | 'tarefa';
  status: 'pendente' | 'concluida' | 'atrasada';
  user?: string;
  priority?: 'baixa' | 'media' | 'alta' | 'critica';
  onClick?: () => void;
}

export function ActivityCard({
  title,
  description,
  timestamp,
  type,
  status,
  user,
  priority,
  onClick
}: ActivityCardProps) {
  const statusConfig = {
    pendente: {
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Pendente'
    },
    concluida: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'Concluída'
    },
    atrasada: {
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'Atrasada'
    }
  };

  const typeConfig = {
    rotina: { color: 'bg-blue-500 dark:bg-blue-600', label: 'Rotina' },
    orientacao: { color: 'bg-purple-500 dark:bg-purple-600', label: 'Orientação' },
    tarefa: { color: 'bg-orange-500 dark:bg-orange-600', label: 'Tarefa' }
  };

  const config = statusConfig[status];
  const typeInfo = typeConfig[type];
  const StatusIcon = config.icon;

  return (
    <AnimatedCard
      onClick={onClick}
      className={cn(
        "p-4 hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div className={cn("p-2 rounded-full", config.bg)}>
          <StatusIcon className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            
            {onClick && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              <div className={cn("w-2 h-2 rounded-full mr-1", typeInfo.color)} />
              {typeInfo.label}
            </Badge>
            
            {priority && priority !== 'baixa' && (
              <Badge 
                variant={priority === 'critica' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            )}

            <span className="text-xs text-muted-foreground ml-auto">
              {timestamp}
            </span>
          </div>

          {user && (
            <p className="text-xs text-muted-foreground mt-1">
              Por {user}
            </p>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

// Progress Card com múltiplas métricas
interface ProgressCardProps {
  title: string;
  description?: string;
  progress: {
    label: string;
    value: number;
    max: number;
    color?: string;
  }[];
  totalProgress?: number;
  icon?: React.ElementType;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

export function ProgressCard({
  title,
  description,
  progress,
  totalProgress,
  icon: Icon,
  actions
}: ProgressCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          
          {totalProgress !== undefined && (
            <div className="text-right">
              <p className="text-2xl font-bold">{totalProgress}%</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {progress.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">
                {item.value}/{item.max}
              </span>
            </div>
            <AnimatedProgress
              value={item.value}
              max={item.max}
              color={item.color}
              showPercentage={false}
            />
          </div>
        ))}

        {actions && actions.length > 0 && (
          <div className="pt-4 flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                onClick={action.onClick}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick Action Card
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick: () => void;
  shortcut?: string;
  badge?: string | number;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  color = 'blue',
  onClick,
  shortcut,
  badge
}: QuickActionCardProps) {
  const colorVariants = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-violet-500',
    orange: 'from-orange-500 to-yellow-500',
    red: 'from-red-500 to-pink-500'
  };

  return (
    <AnimatedCard
      onClick={onClick}
      className="relative overflow-hidden cursor-pointer group"
      hoverScale={1.05}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
        colorVariants[color]
      )} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className={cn(
              "p-3 rounded-lg bg-gradient-to-br w-fit",
              colorVariants[color]
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
            {shortcut && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {shortcut}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          <span>Clique para executar</span>
          <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

// Metric Card para dashboard
interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  color,
  size = 'md'
}: MetricCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", sizeClasses[size])}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
        </div>

        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </Card>
  );
} 