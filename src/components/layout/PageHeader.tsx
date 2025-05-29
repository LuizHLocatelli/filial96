import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  status?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  };
  actions?: ReactNode;
  variant?: "default" | "gradient" | "minimal";
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  status,
  actions,
  variant = "default",
  className
}: PageHeaderProps) {
  const isGradient = variant === "gradient";
  const isMinimal = variant === "minimal";

  return (
    <div className={cn("space-y-2", className)}>
      {/* Container com fundo opcional para variante gradient */}
      <div className={cn(
        "relative",
        isGradient && "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl"
      )}>
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
          isGradient ? "p-4 sm:p-6" : "py-1",
          isMinimal && "py-0"
        )}>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  "p-2 rounded-lg",
                  isMinimal ? "p-1.5" : "p-2",
                  iconColor.includes("primary") ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-6 w-6",
                    isMinimal && "h-5 w-5",
                    iconColor
                  )} />
                </div>
              )}
              <div>
                <h1 className={cn(
                  "font-bold tracking-tight",
                  isGradient 
                    ? "text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    : "text-2xl sm:text-3xl gradient-text",
                  isMinimal && "text-xl sm:text-2xl"
                )}>
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {status && (
              <Badge 
                variant={status.variant || "outline"} 
                className={cn(
                  "text-xs",
                  status.color || "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {status.label}
              </Badge>
            )}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
} 