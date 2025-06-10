
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card-medium rounded-xl p-6 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-xl animate-pulse" />
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        <div className="glass-button rounded-full p-3 bg-primary/10 border border-primary/20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        
        <div className="text-center space-y-2">
          <div className="h-4 bg-muted/30 rounded-lg animate-pulse w-48 mx-auto" />
          <div className="h-3 bg-muted/20 rounded-lg animate-pulse w-32 mx-auto" />
        </div>
        
        {/* Loading dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary/40 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </motion.div>
  );
}
