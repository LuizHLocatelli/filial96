import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDialogScroll } from "@/hooks/useDialogScroll";
import { LucideIcon } from "lucide-react";

interface StandardDialogHeaderProps {
  icon?: LucideIcon;
  iconColor?: "primary" | "red" | "amber" | "blue" | "green";
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const colorStyles = {
  primary: {
    bg: "from-primary/5 via-primary/10 to-primary/5",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
  },
  red: {
    bg: "from-red-500/5 via-red-500/10 to-red-500/5",
    iconBg: "bg-red-500/10",
    iconText: "text-red-500",
  },
  amber: {
    bg: "from-amber-500/5 via-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-500",
  },
  blue: {
    bg: "from-blue-500/5 via-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-500",
  },
  green: {
    bg: "from-green-500/5 via-green-500/10 to-green-500/5",
    iconBg: "bg-green-500/10",
    iconText: "text-green-500",
  },
};

export function StandardDialogHeader({
  icon: Icon,
  iconColor = "primary",
  title,
  description,
  onClose,
  loading = false,
  className,
  children,
}: StandardDialogHeaderProps) {
  const isMobile = useIsMobile();
  const colors = colorStyles[iconColor];

  return (
    <div
      className={cn(
        `bg-gradient-to-br ${colors.bg} border-b flex-shrink-0`,
        isMobile ? "p-4" : "p-6",
        className
      )}
    >
      <DialogHeader className={cn(isMobile ? "space-y-3" : "space-y-4")}>
        <div className="flex items-center justify-between gap-2">
          <DialogTitle
            className={cn(
              "flex items-center gap-2 flex-1 min-w-0",
              isMobile ? "text-base" : "text-lg md:text-xl"
            )}
          >
            {Icon && (
              <div
                className={cn(
                  "rounded-xl shrink-0",
                  isMobile ? "p-2" : "p-2.5",
                  colors.iconBg
                )}
              >
                <Icon
                  className={cn(
                    colors.iconText,
                    isMobile ? "w-5 h-5" : "w-6 h-6"
                  )}
                />
              </div>
            )}
            <span className="truncate">{title}</span>
          </DialogTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-background/50 shrink-0"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "text-sm" : "text-base"
            )}
          >
            {description}
          </p>
        )}
        {children}
      </DialogHeader>
    </div>
  );
}

interface StandardDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function StandardDialogFooter({
  children,
  className,
}: StandardDialogFooterProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex-shrink-0 border-t bg-background",
        isMobile ? "flex flex-col gap-2 p-4" : "flex flex-row gap-3 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StandardDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ⚠️ DEPRECIADO: Este componente tem problemas de scroll no mobile.
 * Use `<div className="flex-1 overflow-y-auto">` diretamente no lugar deste componente.
 * 
 * @deprecated Use div com overflow-y-auto ao invés deste componente
 */
export function StandardDialogContent({
  children,
  className,
}: StandardDialogContentProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent",
        "touch-pan-y select-text",
        isMobile ? "p-4" : "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}