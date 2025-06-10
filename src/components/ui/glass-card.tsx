
import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "medium" | "strong";
  gradient?: "primary" | "secondary" | "accent";
  animate?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "light", gradient, animate = true, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    const gradientClass = gradient ? `glass-${gradient}` : "";
    
    const CardComponent = animate ? motion.div : "div";
    
    const motionProps = animate ? {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: "easeOut" }
    } : {};
    
    return (
      <CardComponent
        ref={ref}
        {...motionProps}
        className={cn(
          `glass-card-${variant}`,
          "rounded-2xl text-card-foreground glass-hover relative overflow-hidden",
          gradientClass,
          isMobile && "rounded-3xl",
          className
        )}
        {...props}
      >
        {children}
      </CardComponent>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
