import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export function LoadingIndicator({ message = "Pensando...", className }: LoadingIndicatorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      role="status"
      aria-label={message}
      className={cn("overflow-hidden w-full max-w-[200px] sm:max-w-[280px] mb-2 mt-1", className)}
    >
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 rounded-2xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10 flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-4 h-4 text-primary" />
          </motion.div>
        </div>

        <div className="relative z-10 flex-1 min-w-0 flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-medium truncate text-foreground">
            {message}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gradient-to-br from-primary/60 to-primary/40 rounded-full"
                animate={{ 
                  opacity: [0.4, 1, 0.4], 
                  y: [0, -3, 0],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
