import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";
import type { StatsData } from "@/hooks/use-dashboard-stats"; // Importar o tipo

interface DashboardOverviewTabProps {
  stats: StatsData;
  isLoading: boolean; // Embora os dados de status do sistema sejam mockados, isLoading pode ser útil para consistência ou esqueletos
}

export function DashboardOverviewTab({ stats, isLoading }: DashboardOverviewTabProps) {
  // Se isLoading for verdadeiro, poderia mostrar Skeletons aqui para os cards de performance e status.
  // Por simplicidade, omitindo Skeletons específicos para esta tab por enquanto,
  // já que a página Dashboard já tem um tratamento de erro global e os StatCards já lidam com isLoading.

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  // Dados mockados para System Status, como no original
  const systemStatuses = [
    { name: "Crediário", status: "Ativo" },
    { name: "Móveis", status: "Ativo" },
    { name: "Cards Promocionais", status: "Ativo" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Taxa de Conclusão</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {completionRate}%
              </Badge>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              <p className="text-xs text-green-600/80">Concluídas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
              <p className="text-xs text-yellow-600/80">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {systemStatuses.map(system => (
              <div key={system.name} className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium">{system.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {system.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 