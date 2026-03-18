import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function LoadingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="overflow-hidden w-full max-w-[280px] sm:max-w-[320px] mb-2 mt-1"
    >
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border bg-muted/40 border-border/50 text-muted-foreground/80 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 relative z-10 bg-background text-primary shadow-sm ring-1 ring-primary/20">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0 relative z-10 flex items-center justify-between">
          <span className="text-[13px] font-medium truncate text-foreground">
            Pensando...
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="w-1.5 h-1.5 bg-primary/40 rounded-full" animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
