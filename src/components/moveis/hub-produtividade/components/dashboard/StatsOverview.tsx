import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ProductivityStats } from '../../types';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';
import { useEffect } from 'react';

interface StatsOverviewProps {
  stats: ProductivityStats;
  isLoading?: boolean;
  onNavigateToSection?: (section: string) => void;
}

export function StatsOverview({ 
  stats, 
  isLoading = false, 
  onNavigateToSection 
}: StatsOverviewProps) {
  const { isMobile } = useResponsive();

  // Debug simplificado
  useEffect(() => {
    if (isMobile) {
      console.log('📱 [MOBILE] StatsOverview - Loading:', isLoading, 'HasData:', stats.rotinas.total + stats.tarefas.total > 0);
    }
  }, [isMobile, isLoading, stats]);

  const statCards = [
    {
      title: 'Rotinas Totais',
      value: stats.rotinas.total,
      subtitle: 'Rotinas cadastradas',
      icon: ListTodo,
      progress: stats.rotinas.total > 0 ? ((stats.rotinas.concluidas / stats.rotinas.total) * 100) : 0,
      sections: [
        { label: 'Concluídas', value: stats.rotinas.concluidas, color: 'bg-emerald-500' },
        { label: 'Pendentes', value: stats.rotinas.pendentes, color: 'bg-blue-500' },
        { label: 'Atrasadas', value: stats.rotinas.atrasadas, color: 'bg-red-500' }
      ],
      onClick: () => onNavigateToSection?.('rotinas'),
      gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50'
    },
    {
      title: 'Tarefas',
      value: stats.tarefas.total,
      subtitle: 'Tarefas em andamento',
      icon: Target,
      progress: stats.tarefas.total > 0 ? ((stats.tarefas.concluidas / stats.tarefas.total) * 100) : 0,
      sections: [
        { label: 'Concluídas', value: stats.tarefas.concluidas, color: 'bg-emerald-500' },
        { label: 'Pendentes', value: stats.tarefas.pendentes, color: 'bg-blue-500' },
        { label: 'Atrasadas', value: stats.tarefas.atrasadas, color: 'bg-red-500' }
      ],
      onClick: () => onNavigateToSection?.('tarefas'),
      gradient: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50'
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
        )}>
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Verificar se as estatísticas têm dados válidos
  const hasValidData = stats.rotinas.total > 0 || stats.tarefas.total > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Visão Geral da Produtividade</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Activity className="h-3 w-3" />
            Atualizado agora
          </p>
        </div>
      </div>

      {/* Stats Grid - Layout otimizado para mobile */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
      )}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg border-0",
                isMobile ? "hover:scale-[1.01]" : "hover:scale-[1.02]",
                `bg-gradient-to-br ${card.gradient}`,
                "hover:bg-gradient-to-br hover:from-white/80 hover:to-white/60",
                "dark:hover:from-background/80 dark:hover:to-background/60"
              )}
              onClick={card.onClick}
            >
              <CardContent className={cn(
                "space-y-3",
                isMobile ? "p-4" : "p-4 lg:p-5"
              )}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-background/50 group-hover:bg-white/80 dark:group-hover:bg-background/80 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>

                {/* Main Value */}
                <div className="space-y-1">
                  <div className={cn(
                    "font-bold tracking-tight",
                    isMobile ? "text-2xl" : "text-3xl"
                  )}>
                    {card.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>

                {/* Progress */}
                {typeof card.progress === 'number' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progresso</span>
                      <span className="text-xs font-medium">{Math.round(card.progress)}%</span>
                    </div>
                    <Progress 
                      value={card.progress} 
                      className="h-2 bg-white/50 dark:bg-background/50" 
                    />
                  </div>
                )}

                {/* Status Sections */}
                <div className="space-y-2">
                  {card.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", section.color)} />
                        <span className="text-xs text-muted-foreground">{section.label}:</span>
                      </div>
                      <span className="text-xs font-medium">{section.value}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "w-full text-xs bg-white/30 dark:bg-background/30 hover:bg-white/50 dark:hover:bg-background/50",
                    isMobile ? "mt-3 min-h-[40px]" : "mt-4"
                  )}
                >
                  Clique para acessar →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo do Dia - Layout compacto para mobile */}
      <div className="mt-6">
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-0">
          <CardContent className={cn(
            isMobile ? "p-4" : "p-4 lg:p-5"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className={cn(
                "font-semibold",
                isMobile ? "text-base" : "text-lg"
              )}>Resumo do Dia</h3>
            </div>
            
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
            )}>
              <div className="text-center">
                <div className={cn(
                  "font-bold text-emerald-600 dark:text-emerald-400",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.rotinas.concluidas + stats.tarefas.concluidas}
                </div>
                <p className="text-sm text-muted-foreground">Itens Concluídos</p>
              </div>
              
              <div className="text-center">
                <div className={cn(
                  "font-bold text-blue-600 dark:text-blue-400",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.rotinas.pendentes + stats.tarefas.pendentes}
                </div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
              
              <div className="text-center">
                <div className={cn(
                  "font-bold text-orange-600 dark:text-orange-400",
                  isMobile ? "text-xl" : "text-2xl"
                )}>
                  {stats.rotinas.atrasadas + stats.tarefas.atrasadas}
                </div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
