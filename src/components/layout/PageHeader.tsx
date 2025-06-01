import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

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
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  status,
  actions,
  variant = "default",
  className,
  breadcrumbs
}: PageHeaderProps) {
  const isGradient = variant === "gradient";
  const isMinimal = variant === "minimal";

  return (
    <div className={cn("space-y-2", className)}>
      {/* Breadcrumbs restaurados */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground"
          aria-label="Navegação estrutural"
        >
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <span
                className={cn(
                  "transition-colors hover:text-foreground",
                  crumb.href ? "cursor-pointer hover:underline" : "text-foreground font-medium"
                )}
                onClick={() => crumb.href && (window.location.href = crumb.href)}
              >
                {crumb.label}
              </span>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Container com fundo sutil para gradient */}
      <div className={cn(
        "relative",
        isGradient && "bg-gradient-to-r from-green-50/20 via-green-50/10 to-transparent rounded-lg"
      )}>
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
          isGradient ? "p-4" : "py-2",
          isMinimal && "py-1"
        )}>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  "flex-shrink-0 p-2 rounded-lg bg-primary/10 border border-primary/20",
                  isMinimal && "p-1.5"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 text-primary",
                    isMinimal && "h-4 w-4"
                  )} />
                </div>
              )}
              <div>
                {/* Título sempre preto como solicitado */}
                <h1 className={cn(
                  "font-semibold tracking-tight text-foreground",
                  "text-lg sm:text-xl lg:text-2xl",
                  isMinimal && "text-base sm:text-lg"
                )}>
                  {title}
                </h1>
                {description && (
                  <p className={cn(
                    "text-muted-foreground mt-0.5",
                    "text-xs sm:text-sm",
                    isMinimal && "text-xs"
                  )}>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions e status melhorados */}
          {(status || actions) && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {status && (
                <Badge 
                  variant={status.variant || "outline"} 
                  className={cn(
                    "text-xs font-medium",
                    status.color || "bg-green-50 text-green-700 border-green-200"
                  )}
                >
                  {status.label}
                </Badge>
              )}
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 