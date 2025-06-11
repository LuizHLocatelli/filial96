import { ProductivityStats } from '../../types';
import { HubHandlers } from '../../types/hubTypes';
import { useResponsive } from '@/hooks/use-responsive';
import { useLayoutPreferences } from '../../hooks/useLayoutPreferences';
import { StatsOverview } from './StatsOverview';
import { QuickActions } from './QuickActions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductivityAssistant } from '../chatbot/ProductivityAssistant';
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
      {/* Assistente de Produtividade - Layout otimizado */}
      <div className="mb-4">
        <ProductivityAssistant />
      </div>

      {/* Header com Stats compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.rotinas.concluidas}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Rotinas Concluídas
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
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

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.tarefas.concluidas}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  Tarefas Concluídas
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {Math.round((stats.rotinas.concluidas + stats.tarefas.concluidas) / (stats.rotinas.total + stats.tarefas.total) * 100) || 0}%
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Taxa de Conclusão
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {stats.rotinas.pendentes + stats.tarefas.pendentes}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
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