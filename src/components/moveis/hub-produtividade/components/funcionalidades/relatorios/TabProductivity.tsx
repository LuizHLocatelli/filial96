
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProductivityMetrics } from './types';

interface TabProductivityProps {
  productivityMetrics: ProductivityMetrics;
  stats: any;
}

export const TabProductivity = ({ productivityMetrics, stats }: TabProductivityProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Metas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Meta Semanal</span>
                <span className="text-sm text-muted-foreground">
                  {productivityMetrics.completedTasks}/{productivityMetrics.weeklyGoal}
                </span>
              </div>
              <Progress 
                value={(productivityMetrics.completedTasks / productivityMetrics.weeklyGoal) * 100} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Meta Mensal</span>
                <span className="text-sm text-muted-foreground">
                  {productivityMetrics.completedTasks}/{productivityMetrics.monthlyGoal}
                </span>
              </div>
              <Progress 
                value={(productivityMetrics.completedTasks / productivityMetrics.monthlyGoal) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Concluídas</span>
              <Badge variant="default">{productivityMetrics.completedTasks}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pendentes</span>
              <Badge variant="secondary">
                {productivityMetrics.totalTasks - productivityMetrics.completedTasks}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Atrasadas</span>
              <Badge variant="destructive">
                {stats.rotinas?.atrasadas || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
