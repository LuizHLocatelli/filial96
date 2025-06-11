import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  fullWidthActionsOnMobile?: boolean;
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
  fullWidthActionsOnMobile = false,
  breadcrumbs
}: PageHeaderProps) {
  const isMinimal = variant === "minimal";
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "bg-card/60 backdrop-blur-lg border rounded-xl shadow-sm p-4",
        className
      )}
    >
      <div
        className={cn(
          fullWidthActionsOnMobile && isMobile
            ? "flex flex-col gap-3"
            : "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",

          isMinimal && "py-1"
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg bg-primary/10 border border-primary/20",
                  isMinimal && "p-1.5"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 text-primary",
                    isMinimal && "h-4 w-4"
                  )}
                />
              </div>
            )}
            <div>
              {/* Título sempre preto como solicitado */}
              <h1
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  "text-lg sm:text-xl lg:text-2xl",
                  isMinimal && "text-base sm:text-lg"
                )}
              >
                {title}
              </h1>
              {description && (
                <p
                  className={cn(
                    "text-muted-foreground mt-0.5",
                    "text-xs sm:text-sm",
                    isMinimal && "text-xs"
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions e status melhorados */}
        {(status || actions) && (
          <div
            className={cn(
              "flex items-center gap-3",
              fullWidthActionsOnMobile && isMobile
                ? "w-full"
                : "flex-shrink-0"
            )}
          >
            {status && (
              <Badge
                variant={status.variant || "outline"}
                className={cn(
                  "text-xs font-medium",
                  status.color ||
                    "bg-green-50 text-green-700 border-green-200"
                )}
              >
                {status.label}
              </Badge>
            )}
            {actions && (
              <div
                className={cn(
                  "flex items-center gap-2",
                  fullWidthActionsOnMobile && isMobile && "w-full"
                )}
              >
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 