
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TabContainerProps } from "./types";

export function TabContainer({ children, isMobile, isSmallScreen }: TabContainerProps) {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed z-50",
        isMobile 
          ? "bottom-6 left-4 right-4 flex justify-center"
          : "bottom-4 left-0 right-0 flex justify-center"
      )}
    >
      {/* Glassmorphism Container */}
      <div className={cn(
        "relative overflow-visible glass-nav glass-primary rounded-3xl shadow-2xl",
        isMobile 
          ? cn(
              "w-full max-w-lg backdrop-blur-2xl",
              isSmallScreen ? "px-2 py-4" : "px-3 py-5"
            )
          : "rounded-3xl px-5 py-4 w-auto max-w-md mx-auto backdrop-blur-2xl"
      )}>
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 opacity-60 rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/10 to-purple-500/15 rounded-3xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent rounded-3xl" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/30 via-blue-500/20 to-purple-500/25 blur-xl opacity-50 -z-10" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Top Highlight */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
      </div>
    </motion.div>
  );
}
