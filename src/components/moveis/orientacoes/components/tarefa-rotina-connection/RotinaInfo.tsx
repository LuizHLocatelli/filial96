import { CheckSquare, Clock, Calendar, ChevronRight } from "lucide-react";
import { RotinaWithStatus } from "../../../rotinas/types";

interface RotinaInfoProps {
  rotina: RotinaWithStatus;
  onViewRotina?: (rotinaId: string) => void;
}

export function RotinaInfo({ rotina, onViewRotina }: RotinaInfoProps) {
  const getPeriodicidadeText = (periodicidade: string) => {
    switch (periodicidade) {
      case 'diario': return 'Diária';
      case 'semanal': return 'Semanal';
      case 'mensal': return 'Mensal';
      case 'personalizado': return 'Personalizada';
      default: return periodicidade;
    }
  };

  const getStatusRotinaColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'text-green-600 dark:text-green-400';
      case 'pendente': return 'text-yellow-600 dark:text-yellow-400';
      case 'atrasada': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div 
      className="p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80 dark:border-zinc-700/50"
      onClick={() => onViewRotina?.(rotina.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-medium">{rotina.nome}</h4>
            {rotina.status && (
              <div className={`text-xs font-medium ${getStatusRotinaColor(rotina.status)}`}>
                ({rotina.status})
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getPeriodicidadeText(rotina.periodicidade)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{rotina.categoria}</span>
            </div>
          </div>

          {rotina.descricao && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {rotina.descricao}
            </p>
          )}
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
      </div>
    </div>
  );
}
