
import { Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservasStats } from "../hooks/useReservasStats";
import { useIsMobile } from "@/hooks/use-mobile";

export function ReservasStats() {
  const { stats, isLoading } = useReservasStats();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={`bg-gray-100 dark:bg-gray-800/50 rounded-2xl ${isMobile ? "h-24" : "h-32"}`} />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total",
      value: stats.total,
      icon: Clock,
      color: "from-green-500/80 to-green-600/80",
      bgColor: "from-green-50/60 to-green-100/60 dark:from-gray-800/40 dark:to-gray-700/40",
      borderColor: "border-green-200/40 dark:border-green-600/20",
      textColor: "text-green-700 dark:text-green-400/80"
    },
    {
      title: "Ativas",
      value: stats.ativas,
      icon: TrendingUp,
      color: "from-emerald-500/80 to-emerald-600/80",
      bgColor: "from-emerald-50/60 to-emerald-100/60 dark:from-gray-800/40 dark:to-gray-700/40",
      borderColor: "border-emerald-200/40 dark:border-emerald-600/20",
      textColor: "text-emerald-700 dark:text-emerald-400/80"
    },
    {
      title: "Convertidas",
      value: stats.convertidas,
      icon: CheckCircle,
      color: "from-green-500/80 to-green-600/80",
      bgColor: "from-green-50/60 to-green-100/60 dark:from-gray-800/40 dark:to-gray-700/40",
      borderColor: "border-green-200/40 dark:border-green-600/20",
      textColor: "text-green-700 dark:text-green-400/80"
    },
    {
      title: "Expiradas",
      value: stats.expiradas,
      icon: AlertCircle,
      color: "from-orange-500/80 to-red-600/80",
      bgColor: "from-orange-50/60 to-red-50/60 dark:from-gray-800/40 dark:to-gray-700/40",
      borderColor: "border-orange-200/40 dark:border-orange-600/20",
      textColor: "text-orange-700 dark:text-orange-400/80"
    }
  ];

  return (
    <div className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden border shadow-sm bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} hover:shadow-md transition-all duration-300`}
          >
            <CardHeader className={isMobile ? "pb-1 pt-3 px-3" : "pb-2 pt-4"}>
              <div className="flex items-center justify-between">
                <div className={`rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm ${
                  isMobile ? "w-8 h-8" : "w-10 h-10"
                }`}>
                  <IconComponent className={`text-white ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${stat.textColor} bg-white/60 dark:bg-gray-700/40 border-0 shadow-sm font-bold px-3 py-1 ${
                    isMobile ? "text-base" : "text-lg"
                  }`}
                >
                  {stat.value}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "pt-0 pb-3 px-3" : "pt-0 pb-4"}>
              <CardTitle className={`font-semibold ${stat.textColor} leading-tight ${
                isMobile ? "text-xs" : "text-sm"
              }`}>
                {stat.title}
              </CardTitle>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
