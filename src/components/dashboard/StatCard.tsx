
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  variant = "default",
  trend,
  isLoading = false
}: StatCardProps) {
  const isMobile = useIsMobile();

  const variantStyles = {
    default: "border-border text-foreground",
    success: "border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 dark:border-green-800",
    warning: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 dark:border-yellow-800",
    danger: "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 dark:border-red-800"
  };

  const iconColors = {
    default: "text-primary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400"
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-medium hover:-translate-y-1 ${variantStyles[variant]}`}>
      <CardContent className={isMobile ? "p-4" : "p-6"}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {trend && (
                <Badge 
                  variant={trend.isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              {isLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <p className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  {value.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          
          <div className={`shrink-0 p-3 rounded-xl bg-background/50 ${iconColors[variant]}`}>
            <Icon className={isMobile ? "h-6 w-6" : "h-8 w-8"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
