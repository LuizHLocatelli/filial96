
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
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalRotinas}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{concluidas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-gray-600">{pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{atrasadas}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Conclusão do dia</span>
              <span>{percentualConclusao.toFixed(1)}%</span>
            </div>
            <Progress value={percentualConclusao} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(estatisticasPorCategoria).map(([categoria, stats]) => {
              const percentual = (stats.concluidas / stats.total) * 100;
              return (
                <div key={categoria} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{categoria}</span>
                    <span>{stats.concluidas}/{stats.total}</span>
                  </div>
                  <Progress value={percentual} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Estatísticas por Periodicidade */}
        <Card>
          <CardHeader>
            <CardTitle>Por Periodicidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(estatisticasPorPeriodicidade).map(([periodicidade, stats]) => {
              const percentual = (stats.concluidas / stats.total) * 100;
              return (
                <div key={periodicidade} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{periodicidadeLabels[periodicidade as keyof typeof periodicidadeLabels]}</span>
                    <span>{stats.concluidas}/{stats.total}</span>
                  </div>
                  <Progress value={percentual} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
