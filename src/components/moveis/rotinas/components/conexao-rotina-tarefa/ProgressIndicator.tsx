
interface ProgressIndicatorProps {
  tarefas: any[];
}

export function ProgressIndicator({ tarefas }: ProgressIndicatorProps) {
  if (tarefas.length === 0) return null;

  const concluidas = tarefas.filter(t => t.status === 'concluida').length;
  const progressPercentage = (concluidas / tarefas.length) * 100;

  return (
    <div className="pt-3 border-t">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Progresso das Tarefas</span>
        <span>{concluidas} / {tarefas.length}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
