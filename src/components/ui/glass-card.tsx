
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "medium" | "strong";
  gradient?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "none";
  animated?: boolean;
  floating?: boolean;
  hoverable?: boolean;
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = "light", 
    gradient = "none",
    animated = false,
    floating = false,
    hoverable = true,
    children, 
    ...props 
  }, ref) => {
    const isMobile = useIsMobile();

    const variantClasses = {
      light: "glass-card",
      medium: "glass-card-medium", 
      strong: "glass-card-strong"
    };

    const gradientClasses = {
      primary: "glass-primary",
      secondary: "glass-secondary",
      accent: "glass-accent",
      success: "glass-primary",
      warning: "glass-accent",
      error: "glass-accent",
      none: ""
    };

    return (
      <motion.div
        ref={ref}
        initial={animated ? { opacity: 0, y: 20, scale: 0.95 } : false}
        animate={animated ? { opacity: 1, y: 0, scale: 1 } : false}
        transition={animated ? { duration: 0.5, ease: "easeOut" } : false}
        className={cn(
          "rounded-xl relative overflow-hidden",
          variantClasses[variant],
          gradientClasses[gradient],
          hoverable && "glass-hover",
          floating && "glass-float",
          isMobile && "rounded-2xl",
          className
        )}
        {...props}
      >
        {/* Glassmorphism Inner Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Bottom Highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
