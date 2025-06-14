
import { Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservasStats } from "../hooks/useReservasStats";

export function ReservasStats() {
  const { stats, isLoading } = useReservasStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Reservas",
      value: stats.total,
      icon: Clock,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/60 dark:to-green-800/60",
      borderColor: "border-green-200/50 dark:border-green-600/30",
      textColor: "text-green-700 dark:text-green-300"
    },
    {
      title: "Ativas",
      value: stats.ativas,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/60 dark:to-blue-800/60",
      borderColor: "border-blue-200/50 dark:border-blue-600/30",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Convertidas",
      value: stats.convertidas,
      icon: CheckCircle,
      color: "from-emerald-500 to-green-600",
      bgColor: "from-emerald-50 to-green-50 dark:from-emerald-900/60 dark:to-emerald-800/60",
      borderColor: "border-emerald-200/50 dark:border-emerald-600/30",
      textColor: "text-emerald-700 dark:text-emerald-300"
    },
    {
      title: "Expiradas",
      value: stats.expiradas,
      icon: AlertCircle,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-900/60 dark:to-red-900/60",
      borderColor: "border-orange-200/50 dark:border-orange-600/30",
      textColor: "text-orange-700 dark:text-orange-300"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            {/* Overlay decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-black/20 pointer-events-none" />
            
            <CardHeader className="relative pb-2 pt-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${stat.textColor} bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm font-bold text-lg px-3 py-1`}
                >
                  {stat.value}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0 pb-4">
              <CardTitle className={`text-sm font-semibold ${stat.textColor} leading-tight`}>
                {stat.title}
              </CardTitle>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
