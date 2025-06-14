
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { CategoryStats } from './types';
import { getTrendIcon } from './utils';

interface TabCategoriesProps {
  categoryStats: CategoryStats[];
}

export const TabCategories = ({ categoryStats }: TabCategoriesProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((category, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{category.name}</h4>
              {getTrendIcon(category.trend)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total: {category.total}</span>
                <span>Concluídas: {category.completed}</span>
              </div>
              <Progress value={category.completionRate} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {category.completionRate.toFixed(1)}% de conclusão
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categoryStats.length === 0 && (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sem dados por categoria</h3>
          <p className="text-muted-foreground">
            Adicione categorias às suas atividades para ver análises detalhadas.
          </p>
        </Card>
      )}
    </div>
  );
};
