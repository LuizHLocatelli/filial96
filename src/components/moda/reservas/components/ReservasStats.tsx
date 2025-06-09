import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, AlertTriangle, TrendingUp, ShoppingBag, Target, Timer, Zap } from "lucide-react";
import { useReservasStats } from "../hooks/useReservasStats";
import { cn } from "@/lib/utils";

const statsConfig = [
  {
    id: 'total_ativas',
    title: 'Reservas Ativas',
    description: 'Aguardando conversão',
    icon: Clock,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/70 dark:to-green-800/70',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-green-700 dark:text-green-300'
  },
  {
    id: 'expirando_24h',
    title: 'Expirando Hoje',
    description: 'Necessitam atenção',
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/70 dark:to-red-900/70',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
    textColor: 'text-orange-700 dark:text-orange-300'
  },
  {
    id: 'taxa_conversao',
    title: 'Taxa de Conversão',
    description: 'Performance atual',
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/70 dark:to-green-800/70',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-green-700 dark:text-green-300',
    suffix: '%'
  },
  {
    id: 'total_convertidas',
    title: 'Vendas Realizadas',
    description: 'Este mês',
    icon: CheckCircle,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/70 dark:to-green-800/70',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-green-700 dark:text-green-300'
  }
];

export function ReservasStats() {
  const { stats, isLoading } = useReservasStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-3 lg:mb-8">
        {statsConfig.map((_, i) => (
          <Card key={i} className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-green-900/60 dark:to-green-800/60 animate-pulse" />
            <CardContent className="relative p-3 lg:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 lg:space-y-3 flex-1">
                  <div className="h-3 lg:h-4 bg-gray-300 dark:bg-green-600/40 rounded animate-pulse"></div>
                  <div className="h-6 lg:h-8 bg-gray-300 dark:bg-green-600/40 rounded animate-pulse"></div>
                  <div className="h-2 lg:h-3 bg-gray-300 dark:bg-green-600/40 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gray-300 dark:bg-green-600/40 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    { ...statsConfig[0], value: stats.total_ativas },
    { ...statsConfig[1], value: stats.expirando_24h },
    { ...statsConfig[2], value: stats.taxa_conversao },
    { ...statsConfig[3], value: '-' } // Placeholder para vendas realizadas
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-3 lg:mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const isHighPriority = stat.id === 'expirando_24h' && typeof stat.value === 'number' && stat.value > 0;
        
        return (
          <Card 
            key={stat.id} 
            className={cn(
              "group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105",
              "bg-gradient-to-br", 
              stat.bgGradient,
              isHighPriority && "ring-2 ring-orange-400 dark:ring-orange-600 animate-pulse"
            )}
          >
            {/* Overlay decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-black/20 pointer-events-none" />
            
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            <CardContent className="relative p-3 lg:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 lg:space-y-3 flex-1 min-w-0">
                  {/* Título */}
                  <h3 className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                    {stat.title}
                  </h3>
                  
                  {/* Valor principal */}
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-xl lg:text-3xl font-bold transition-colors duration-200",
                      stat.textColor
                    )}>
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className={cn("text-sm lg:text-lg font-medium", stat.textColor)}>
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  
                  {/* Descrição */}
                  <p className="text-xs text-muted-foreground font-medium hidden lg:block">
                    {stat.description}
                  </p>
                  
                  {/* Indicador de prioridade */}
                  {isHighPriority && (
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-300 hidden lg:flex">
                      <Zap className="h-3 w-3" />
                      Ação necessária
                    </div>
                  )}
                </div>
                
                {/* Ícone */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110",
                  stat.iconBg
                )}>
                  <Icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
              
              {/* Barra de progresso para taxa de conversão */}
              {stat.id === 'taxa_conversao' && typeof stat.value === 'number' && (
                <div className="mt-3 lg:mt-4 space-y-2 hidden lg:block">
                  <div className="w-full bg-white/30 dark:bg-black/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(stat.value, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Meta: 80%</span>
                  </div>
                </div>
              )}
              
              {/* Indicator para reservas expirando */}
              {stat.id === 'expirando_24h' && typeof stat.value === 'number' && stat.value > 0 && (
                <div className="mt-3 lg:mt-4 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800 hidden lg:block">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                      Contate os clientes hoje
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
