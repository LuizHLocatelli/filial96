
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2 } from 'lucide-react';

interface TimelineEmptyStateProps {
  onCreateNew: (type: 'rotina' | 'tarefa') => void;
  onAddTarefa: () => void;
}

export function TimelineEmptyState({ onCreateNew, onAddTarefa }: TimelineEmptyStateProps) {
  return (
    <Card className="dark:bg-gray-800/50 dark:border-gray-700">
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhuma atividade encontrada</h3>
            <p className="text-muted-foreground dark:text-gray-400">
              Crie sua primeira rotina ou tarefa para começar.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                onClick={() => onCreateNew('rotina')} 
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Rotina
              </Button>
              <Button 
                onClick={onAddTarefa}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
