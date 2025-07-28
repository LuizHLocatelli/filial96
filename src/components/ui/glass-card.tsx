
import * as React from "react";
import { cn } from "@/lib/utils";

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "light" | "medium" | "strong";
    gradient?: "primary" | "secondary" | "accent";
  }
>(({ className, variant = "light", gradient, children, ...props }, ref) => {
  const gradientClass = gradient ? `glass-${gradient}` : "";
  
  return (
    <div
      ref={ref}
      className={cn(
        `glass-card-${variant}`,
        "rounded-xl text-card-foreground glass-hover relative overflow-hidden border border-border/20",
        gradientClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
})
GlassCard.displayName = "GlassCard"

export { GlassCard };
