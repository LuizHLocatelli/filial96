import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, Target } from 'lucide-react';
import { RotinaWithStatus } from '../types';

interface RotinasStatsProps {
  rotinas: RotinaWithStatus[];
}

export function RotinasStats({ rotinas }: RotinasStatsProps) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumo Geral - 2 colunas em mobile, 4 em desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{totalRotinas}</p>
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{concluidas}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-600">{pendentes}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{atrasadas}</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Conclusão do dia</span>
              <span className="font-medium">{percentualConclusao.toFixed(1)}%</span>
            </div>
            <Progress value={percentualConclusao} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas detalhadas - stack em mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Estatísticas por Categoria */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 sm:space-y-4">
            {Object.entries(estatisticasPorCategoria).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria encontrada
              </p>
            ) : (
              Object.entries(estatisticasPorCategoria).map(([categoria, stats]) => {
                const percentual = (stats.concluidas / stats.total) * 100;
                return (
                  <div key={categoria} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{categoria}</span>
                      <span className="text-muted-foreground">{stats.concluidas}/{stats.total}</span>
                    </div>
                    <Progress value={percentual} className="h-1.5" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Estatísticas por Periodicidade */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Por Periodicidade</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 sm:space-y-4">
            {Object.entries(estatisticasPorPeriodicidade).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma periodicidade encontrada
              </p>
            ) : (
              Object.entries(estatisticasPorPeriodicidade).map(([periodicidade, stats]) => {
                const percentual = (stats.concluidas / stats.total) * 100;
                return (
                  <div key={periodicidade} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{periodicidadeLabels[periodicidade as keyof typeof periodicidadeLabels]}</span>
                      <span className="text-muted-foreground">{stats.concluidas}/{stats.total}</span>
                    </div>
                    <Progress value={percentual} className="h-1.5" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
