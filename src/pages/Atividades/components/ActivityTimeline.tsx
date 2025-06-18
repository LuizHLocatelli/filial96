import { ActivityItem } from "../types";

interface ActivityTimelineProps {
  activities: ActivityItem[];
  isLoading: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

export function ActivityTimeline({ activities, isLoading, onActivityClick }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>Carregando atividades...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>Nenhuma atividade encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center text-muted-foreground p-8">
        <p>A funcionalidade de Timeline foi removida.</p>
        <p>Exibindo {activities.length} atividades filtradas.</p>
        
        {/* Lista simples das atividades */}
        <div className="mt-6 space-y-3 max-w-2xl mx-auto">
          {activities.slice(0, 5).map(activity => (
            <div 
              key={activity.id} 
              className="text-left p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.user} • {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  activity.status === 'concluida' ? 'bg-green-100 text-green-800' :
                  activity.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-primary/10 text-primary'
                }`}>
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
          
          {activities.length > 5 && (
            <p className="text-xs text-muted-foreground">
              E mais {activities.length - 5} atividades...
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 