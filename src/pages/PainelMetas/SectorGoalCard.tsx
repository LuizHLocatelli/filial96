import React from 'react';
import { FiEdit } from 'react-icons/fi';
import {
  Target,
  ShoppingCart,
  Shirt,
  ShieldCheck,
  Award,
  Smartphone,
  Gem,
  PlusCircle,
} from 'lucide-react';
import { Goal } from './types';
import { calculateProgress, formatGoalValue } from './utils';

interface SectorGoalCardProps {
  sector: Goal;
  onSetGoal: (sector: Goal) => void;
  onDrillDown?: () => void;
}

const sectorIcons: { [key: string]: React.ElementType } = {
  Eletromóveis: ShoppingCart,
  Moda: Shirt,
  Garantias: ShieldCheck,
  Serviços: Award,
  Telefonia: Smartphone,
  Consórcio: Gem,
  'Seguro Roubo e Furto': ShieldCheck,
  'Garantia Avulsa': PlusCircle,
  default: Target,
};

const SectorGoalCard: React.FC<SectorGoalCardProps> = ({
  sector,
  onSetGoal,
  onDrillDown,
}) => {
  const progress = calculateProgress(sector.currentValue, sector.monthlyGoal);
  const isDrillDownable = onDrillDown !== undefined;

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress > 75) return 'bg-green-600';
    if (progress > 50) return 'bg-yellow-500';
    if (progress > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const cardClasses = `
    relative overflow-hidden group
    bg-card border border-border
    rounded-2xl shadow-lg 
    p-5 flex flex-col justify-between 
    transition-all duration-300 
    hover:shadow-xl hover:border-primary hover:transform hover:-translate-y-1.5
    ${isDrillDownable ? 'cursor-pointer' : ''}
  `;

  const Icon = sectorIcons[sector.sector] || sectorIcons.default;

  return (
    <div className={cardClasses} onClick={onDrillDown}>
      <div className="absolute -top-4 -right-4 z-0">
        <Icon className="h-28 w-28 text-gray-200/5 dark:text-white/5" />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {sector.sector}
            </h3>
            {sector.goalType === 'quantity' && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                (Quantidade)
              </span>
            )}
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              onSetGoal(sector);
            }}
            className="absolute top-0 right-0 z-20 rounded-bl-lg bg-black/10 p-2 text-gray-500 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/20 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label={`Editar meta de ${sector.sector}`}
          >
            <FiEdit size={16} />
          </button>
        </div>

        <div className="space-y-2 text-base">
          <p className="flex justify-between text-gray-600 dark:text-gray-300">
            <span className="font-medium">Alcançado:</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatGoalValue(sector.currentValue, sector.goalType)}
            </span>
          </p>
          <p className="flex justify-between text-gray-600 dark:text-gray-300">
            <span className="font-medium">Meta:</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {formatGoalValue(sector.monthlyGoal, sector.goalType)}
            </span>
          </p>
        </div>
      </div>
      <div className="relative z-10 mt-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Progresso
          </span>
          <span className="text-lg font-bold text-gray-800 dark:text-white">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-3 rounded-full ${getProgressColor()} transition-all duration-700 ease-out`}
            style={{ width: `${progress > 100 ? 100 : progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SectorGoalCard; 