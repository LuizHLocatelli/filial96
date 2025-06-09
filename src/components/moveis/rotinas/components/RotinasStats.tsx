import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { RotinaWithStatus } from '../types';
import { useIsMobile } from '@/hooks/use-mobile';

interface RotinasStatsProps {
  rotinas: RotinaWithStatus[];
}

export function RotinasStats({ rotinas }: RotinasStatsProps) {
  const isMobile = useIsMobile();
  const totalRotinas = rotinas.length;
  const concluidas = rotinas.filter(r => r.status === 'concluida').length;
  const pendentes = rotinas.filter(r => r.status === 'pendente').length;
  const atrasadas = rotinas.filter(r => r.status === 'atrasada').length;

  const percentualConclusao = totalRotinas > 0 ? (concluidas / totalRotinas) * 100 : 0;

  // Estatísticas por categoria
  const estatisticasPorCategoria = rotinas.reduce((acc, rotina) => {
    if (!acc[rotina.categoria]) {
      acc[rotina.categoria] = { total: 0, concluidas: 0 };
    }
    acc[rotina.categoria].total++;
    if (rotina.status === 'concluida') {
      acc[rotina.categoria].concluidas++;
    }
    return acc;
  }, {} as Record<string, { total: number; concluidas: number }>);

  // Estatísticas por periodicidade
  const estatisticasPorPeriodicidade = rotinas.reduce((acc, rotina) => {
    if (!acc[rotina.periodicidade]) {
      acc[rotina.periodicidade] = { total: 0, concluidas: 0 };
    }
    acc[rotina.periodicidade].total++;
    if (rotina.status === 'concluida') {
      acc[rotina.periodicidade].concluidas++;
    }
    return acc;
  }, {} as Record<string, { total: number; concluidas: number }>);

  const periodicidadeLabels = {
    diario: 'Diárias',
    semanal: 'Semanais',
    mensal: 'Mensais',
    personalizado: 'Personalizadas'
  };

  // Se não há rotinas, mostrar estado vazio mais compacto
  if (totalRotinas === 0) {
    return (
      <div className="mb-6">
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-green-50 dark:bg-green-950/50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma rotina criada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira rotina para começar a organizar suas tarefas obrigatórias.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Cards de métricas principais - 2x2 em mobile, 4x1 em desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-green-200/50 dark:border-green-800/50">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-700 dark:text-green-300`}>
                  {totalRotinas}
                </p>
              </div>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center`}>
                <Target className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 dark:text-green-400`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 dark:border-green-800/50">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Concluídas</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-700 dark:text-green-300`}>
                  {concluidas}
                </p>
              </div>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center`}>
                <CheckCircle2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 dark:text-green-400`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200/50 dark:border-yellow-800/50">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Pendentes</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-700 dark:text-yellow-300`}>
                  {pendentes}
                </p>
              </div>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center`}>
                <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-600 dark:text-yellow-400`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200/50 dark:border-red-800/50">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Atrasadas</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-700 dark:text-red-300`}>
                  {atrasadas}
                </p>
              </div>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center`}>
                <AlertCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-600 dark:text-red-400`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral - mais compacto */}
      <Card className="border-green-200/50 dark:border-green-800/50">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-green-700 dark:text-green-300">Progresso do Dia</h3>
            </div>
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              {percentualConclusao.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={percentualConclusao} 
            className="h-2 bg-green-100 dark:bg-green-900/50" 
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{concluidas} de {totalRotinas} rotinas</span>
            <span>
              {atrasadas > 0 && `${atrasadas} atrasada${atrasadas > 1 ? 's' : ''}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas detalhadas - só mostrar se houver dados suficientes */}
      {Object.keys(estatisticasPorCategoria).length > 1 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Estatísticas por Categoria */}
          <Card>
            <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4'}`}>
              <CardTitle className="text-base font-medium text-green-700 dark:text-green-300">
                Por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className={`${isMobile ? 'px-4 pb-4' : 'pt-0'} space-y-3`}>
              {Object.entries(estatisticasPorCategoria).map(([categoria, stats]) => {
                const percentual = (stats.concluidas / stats.total) * 100;
                return (
                  <div key={categoria} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium text-green-700 dark:text-green-300">
                        {categoria}
                      </span>
                      <span className="text-muted-foreground">{stats.concluidas}/{stats.total}</span>
                    </div>
                    <Progress value={percentual} className="h-1.5 bg-green-100 dark:bg-green-900/50" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Estatísticas por Periodicidade */}
          <Card>
            <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4'}`}>
              <CardTitle className="text-base font-medium text-green-700 dark:text-green-300">
                Por Periodicidade
              </CardTitle>
            </CardHeader>
            <CardContent className={`${isMobile ? 'px-4 pb-4' : 'pt-0'} space-y-3`}>
              {Object.entries(estatisticasPorPeriodicidade).map(([periodicidade, stats]) => {
                const percentual = (stats.concluidas / stats.total) * 100;
                return (
                  <div key={periodicidade} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">
                        {periodicidadeLabels[periodicidade as keyof typeof periodicidadeLabels]}
                      </span>
                      <span className="text-muted-foreground">{stats.concluidas}/{stats.total}</span>
                    </div>
                    <Progress value={percentual} className="h-1.5 bg-green-100 dark:bg-green-900/50" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
