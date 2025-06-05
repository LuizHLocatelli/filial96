
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TabContainerProps } from "./types";

export function TabContainer({ children, isMobile, isSmallScreen }: TabContainerProps) {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed z-50",
        isMobile 
          ? "bottom-6 left-4 right-4 flex justify-center"
          : "bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md"
      )}
    >
      {/* Container Glass Morphism Premium */}
      <div className={cn(
        "relative overflow-hidden nav-glass-effect nav-glow",
        isMobile 
          ? cn(
              "rounded-3xl shadow-2xl shadow-black/20 ring-1 ring-white/30 w-full max-w-lg",
              isSmallScreen ? "px-3 py-4" : "px-4 py-5"
            )
          : "rounded-3xl px-5 py-4"
      )}>
        
        {/* Gradiente decorativo premium */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        </div>
        
        {children}
      </div>
    </motion.div>
  );
}
