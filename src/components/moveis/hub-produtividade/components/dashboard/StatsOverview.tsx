
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckSquare, Clock, AlertTriangle, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatsData {
  totalRotinas: number;
  rotinasConcluidas: number;
  rotinasPendentes: number;
  rotinasAtrasadas: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasPendentes: number;
  tarefasAtrasadas: number;
  progressoGeral: number;
}

interface StatsOverviewProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
      )}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className={cn("p-4", isMobile && "p-3")}>
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const rotinasStats = [
    {
      title: "Total",
      value: stats.totalRotinas,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Concluídas",
      value: stats.rotinasConcluidas,
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Pendentes",
      value: stats.rotinasPendentes,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    {
      title: "Atrasadas",
      value: stats.rotinasAtrasadas,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Estatísticas de Rotinas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className={cn(
            "font-semibold text-foreground",
            isMobile ? "text-base" : "text-lg"
          )}>
            Rotinas
          </h3>
        </div>
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
        )}>
          {rotinasStats.map((stat) => (
            <Card key={stat.title} className={cn(
              "glass-card glass-hover transition-all duration-200",
              stat.borderColor,
              isMobile && "min-h-[100px]"
            )}>
              <CardContent className={cn("p-4", isMobile && "p-3")}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className={cn(
                      "text-muted-foreground font-medium",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {stat.title}
                    </p>
                    <p className={cn(
                      "font-bold",
                      stat.color,
                      isMobile ? "text-lg" : "text-2xl"
                    )}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-full p-2",
                    stat.bgColor
                  )}>
                    <stat.icon className={cn(
                      stat.color,
                      isMobile ? "h-4 w-4" : "h-5 w-5"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progresso Geral */}
      <Card className="glass-card">
        <CardContent className={cn("p-4", isMobile && "p-3")}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className={cn(
                "text-green-600",
                isMobile ? "h-4 w-4" : "h-5 w-5"
              )} />
              <span className={cn(
                "font-semibold text-foreground",
                isMobile ? "text-sm" : "text-base"
              )}>
                Progresso do Dia
              </span>
            </div>
            <Badge variant="outline" className={cn(
              "bg-green-50 text-green-700 border-green-200",
              isMobile ? "text-xs px-2 py-1" : "text-sm"
            )}>
              {stats.progressoGeral.toFixed(1)}%
            </Badge>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.progressoGeral, 100)}%` }}
            />
          </div>
          
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {stats.rotinasConcluidas + stats.tarefasConcluidas} de{' '}
            {stats.totalRotinas + stats.totalTarefas} atividades
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
