
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

export const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
    default: return <Zap className="h-4 w-4 text-blue-600" />;
  }
};
