import { ProductivityStats } from '../../types';
import { HubHandlers } from '../../types/hubTypes';
import { useResponsive } from '@/hooks/use-responsive';
import { useLayoutPreferences } from '../../hooks/useLayoutPreferences';
import { StatsOverview } from './StatsOverview';
import { QuickActions } from './QuickActions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  Target, 
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface DesktopLayoutProps {
  stats: ProductivityStats;
  isLoading: boolean;
  handlers: HubHandlers;
  rotinas?: any[];
  tarefas?: any[];
  onViewRotina?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

export function DesktopLayout({
  stats,
  isLoading,
  handlers,
  rotinas = [],
  tarefas = [],
  onViewRotina,
  onViewTarefa
}: DesktopLayoutProps) {
  const { isCompact } = useLayoutPreferences();

  return (
    <div className="space-y-4">
      {/* Header com Stats compactos */}
              <div className="grid-responsive-dashboard">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.produtividade.score.toFixed(0)}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Produtividade
                </div>
                <Progress 
                  value={stats.produtividade.score} 
                  className="h-1.5 mt-2 bg-green-200 dark:bg-green-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-primary">
                  {stats.rotinas.concluidas}
                </div>
                <div className="text-xs text-primary/70">
                  Rotinas Concluídas
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-primary/20 dark:bg-primary/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${stats.rotinas.total > 0 ? (stats.rotinas.concluidas / stats.rotinas.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    /{stats.rotinas.total}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {stats.tarefas.concluidas}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Tarefas Concluídas
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ 
                        width: `${stats.tarefas.total > 0 ? (stats.tarefas.concluidas / stats.tarefas.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    /{stats.tarefas.total}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                {(stats.rotinas.atrasadas + stats.tarefas.atrasadas) > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {stats.rotinas.atrasadas + stats.tarefas.atrasadas}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Itens Atrasados
                </div>
                {(stats.rotinas.atrasadas + stats.tarefas.atrasadas) > 0 && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    Atenção
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal - Duas colunas otimizadas */}
              <div className="grid-responsive-dashboard xl:grid-cols-12">
        {/* Coluna Principal - Central de Ferramentas */}
        <div className="xl:col-span-12 space-y-4">
          {/* Ações Rápidas */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Central de Ferramentas</h2>
                  <p className="text-sm text-muted-foreground">
                    Acesso rápido às principais funcionalidades
                  </p>
                </div>
              </div>

              <QuickActions
                onNovaRotina={handlers.onNovaRotina}
                onNovaOrientacao={handlers.onNovaOrientacao}
                onNovaTarefa={handlers.onNovaTarefa}
                onRefreshData={handlers.onRefreshData}
                onExportData={handlers.onExportData}
                onShowFilters={handlers.onShowFilters}
                onBuscaAvancada={handlers.onBuscaAvancada || (() => {})}
                onFiltrosPorData={handlers.onFiltrosPorData || (() => {})}
                onRelatorios={handlers.onRelatorios || (() => {})}
                isRefreshing={isLoading}
                hideHeader={true}
              />
            </CardContent>
          </Card>

          {/* Insights Rápidos */}
                      <div className="grid-responsive-wide">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-primary">
                      {Math.round((stats.rotinas.concluidas + stats.tarefas.concluidas) / (stats.rotinas.total + stats.tarefas.total) * 100) || 0}%
                    </div>
                    <div className="text-xs text-primary/70">
                      Taxa de Conclusão
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {stats.rotinas.pendentes + stats.tarefas.pendentes}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      Itens Pendentes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 