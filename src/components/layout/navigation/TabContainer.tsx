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
          : "bottom-4 left-0 right-0 flex justify-center"
      )}
    >
      {/* Container Glass Morphism Premium */}
      <div className={cn(
        "relative overflow-visible nav-glass-effect nav-glow",
        isMobile 
          ? cn(
              "rounded-[2rem] shadow-2xl shadow-black/20 ring-1 ring-white/30 w-full max-w-lg",
              isSmallScreen ? "px-2 py-4" : "px-3 py-5"
            )
          : "rounded-[2rem] px-5 py-4 w-auto max-w-md mx-auto"
      )}>
        
        {/* Gradiente decorativo premium */}
        <div className="absolute inset-0 opacity-60 rounded-[2rem]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-[2rem]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent rounded-[2rem]" />
        </div>
        
        {children}
      </div>
    </motion.div>
  );
}
