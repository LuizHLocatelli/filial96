
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  spacing?: "tight" | "normal" | "relaxed";
  className?: string;
  fullHeight?: boolean;
  glassmorphism?: boolean;
}

export function PageLayout({
  children,
  maxWidth = "full",
  spacing = "normal",
  className,
  fullHeight = false,
  glassmorphism = true
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full"
  };

  const spacingClasses = {
    tight: "space-y-1.5 sm:space-y-2",
    normal: "space-y-2.5 sm:space-y-4",
    relaxed: "space-y-4 sm:space-y-6"
  };

  const paddingClasses = {
    tight: "px-3 sm:px-4 py-2 sm:py-3",
    normal: "px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5",
    relaxed: "px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "w-full mx-auto relative",
        fullHeight && "min-h-screen",
        spacingClasses[spacing],
        maxWidthClasses[maxWidth],
        paddingClasses[spacing],
        glassmorphism && "glass-card rounded-2xl backdrop-blur-xl shadow-2xl",
        className
      )}
    >
      {glassmorphism && (
        <>
          {/* Glassmorphism effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
} 
