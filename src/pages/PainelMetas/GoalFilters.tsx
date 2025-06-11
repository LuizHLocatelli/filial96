import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Timeframe = 'day' | 'week' | 'month';

interface GoalFiltersProps {
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const GoalFilters: React.FC<GoalFiltersProps> = ({ 
  currentDate, 
  onMonthChange,
  selectedTimeframe,
  onTimeframeChange
}) => {
  const formattedDate = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });

  const timeframeOptions: { id: Timeframe; label: string }[] = [
    { id: 'day', label: 'Diário' },
    { id: 'week', label: 'Semanal' },
    { id: 'month', label: 'Mensal' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-card dark:bg-card rounded-xl shadow-md">
      {/* Month Selector */}
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <button 
          onClick={() => onMonthChange('prev')} 
          className="p-2 rounded-full hover:bg-muted dark:hover:bg-muted transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-6 h-6 text-foreground/80 dark:text-foreground/80" />
        </button>
        <span className="text-lg font-bold text-card-foreground dark:text-card-foreground w-48 text-center capitalize">
          {formattedDate}
        </span>
        <button 
          onClick={() => onMonthChange('next')} 
          className="p-2 rounded-full hover:bg-muted dark:hover:bg-muted transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-6 h-6 text-foreground/80 dark:text-foreground/80" />
        </button>
      </div>

      {/* Timeframe Filter */}
      <div className="flex items-center bg-muted dark:bg-muted rounded-full p-1">
        {timeframeOptions.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTimeframeChange(id)}
            className={`
              px-4 py-1.5 text-sm font-semibold rounded-full transition-colors
              ${selectedTimeframe === id 
                ? 'bg-primary text-primary-foreground shadow' 
                : 'text-secondary-foreground hover:bg-background/60 dark:hover:bg-background/60'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GoalFilters; 