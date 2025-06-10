
import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glassmorphism?: boolean;
    variant?: "default" | "glass" | "gradient";
  }
>(({ className, glassmorphism = true, variant = "glass", ...props }, ref) => {
  const isMobile = useIsMobile();
  
  const variantClasses = {
    default: "bg-card border",
    glass: "glass-card glass-hover",
    gradient: "glass-card glass-primary glass-hover"
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-xl text-card-foreground shadow-lg transition-all duration-300",
        glassmorphism ? variantClasses[variant] : variantClasses.default,
        isMobile && "rounded-2xl",
        className
      )}
      {...props}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col relative z-10",
        isMobile ? "space-y-1 p-4" : "space-y-1.5 p-6",
        className
      )}
      {...props}
    />
  );
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight gradient-text",
        isMobile ? "text-lg" : "text-2xl",
        className
      )}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <p
      ref={ref}
      className={cn(
        "text-muted-foreground/80",
        isMobile ? "text-xs" : "text-sm",
        className
      )}
      {...props}
    />
  );
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      ref={ref} 
      className={cn(
        "relative z-10",
        isMobile ? "p-4 pt-0" : "p-6 pt-0", 
        className
      )} 
      {...props} 
    />
  );
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center relative z-10",
        isMobile ? "p-4 pt-0" : "p-6 pt-0",
        className
      )}
      {...props}
    />
  );
})
CardFooter.displayName = "CardFooter"

// Enhanced Glass Card variants
const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "light" | "medium" | "strong";
    gradient?: "primary" | "secondary" | "accent";
  }
>(({ className, variant = "light", gradient, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  const gradientClass = gradient ? `glass-${gradient}` : "";
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        `glass-card-${variant}`,
        "rounded-2xl text-card-foreground glass-hover relative overflow-hidden",
        gradientClass,
        isMobile && "rounded-3xl",
        className
      )}
      {...props}
    />
  );
})
GlassCard.displayName = "GlassCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, GlassCard }
