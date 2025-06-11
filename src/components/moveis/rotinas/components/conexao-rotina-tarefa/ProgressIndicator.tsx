
interface ProgressIndicatorProps {
  tarefas: any[];
}

export function ProgressIndicator({ tarefas }: ProgressIndicatorProps) {
  if (tarefas.length === 0) return null;

  const concluidas = tarefas.filter(t => t.status === 'concluida').length;
  const progressPercentage = (concluidas / tarefas.length) * 100;

  return (
    <div className="pt-2 sm:pt-3 border-t mt-2 sm:mt-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="font-medium">Progresso das Tarefas</span>
        <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">
          {concluidas} / {tarefas.length}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 sm:h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-1 text-center">
        {progressPercentage.toFixed(0)}% concluído
      </div>
    </div>
  );
}
