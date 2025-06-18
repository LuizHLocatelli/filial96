import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Target, CheckCircle, AlertCircle } from 'lucide-react';

export const TabTrends = () => {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">+12%</div>
          <div className="text-sm text-muted-foreground">Crescimento mensal</div>
        </Card>

        <Card className="p-4 text-center">
                        <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">18</div>
          <div className="text-sm text-muted-foreground">Dias produtivos</div>
        </Card>

        <Card className="p-4 text-center">
                        <Target className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">87%</div>
          <div className="text-sm text-muted-foreground">Precisão nas metas</div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">Excelente performance</div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Sua taxa de conclusão está acima da média.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg dark:bg-primary/10 dark:border-primary/30">
                          <Target className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium text-primary">Oportunidade</div>
              <div className="text-sm text-primary/80">
                Considere dividir tarefas grandes em subtarefas menores.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950/20 dark:border-orange-800">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <div className="font-medium text-orange-800 dark:text-orange-200">Atenção necessária</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Algumas rotinas estão atrasadas. Revise prazos e prioridades.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
