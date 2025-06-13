
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
      <CardContent className="p-6 sm:p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 max-w-sm mx-auto">
              Crie sua primeira rotina ou tarefa para começar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-6 max-w-xs sm:max-w-none mx-auto">
            <Button 
              onClick={() => onCreateNew('rotina')} 
              variant="outline"
              size="sm"
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Nova Rotina
            </Button>
            <Button 
              onClick={onAddTarefa}
              size="sm"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
