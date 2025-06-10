
import { motion } from "framer-motion";
import { FileX, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-xl p-8 text-center relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-blue-500/5 rounded-xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400/20 to-transparent" />
      
      <div className="relative z-10 space-y-4">
        {/* Icon with glow effect */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mx-auto w-16 h-16 glass-card-medium rounded-2xl flex items-center justify-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-blue-400/10 rounded-2xl" />
          <FileX className="h-8 w-8 text-muted-foreground/60" />
          
          {/* Floating sparkles */}
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
          >
            <Sparkles className="h-3 w-3 text-blue-400/40" />
          </motion.div>
        </motion.div>
        
        {/* Text content */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground/80">
            Nenhuma rotina relacionada
          </h4>
          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
            Esta tarefa ainda não possui uma rotina vinculada. 
            As conexões aparecerão aqui quando disponíveis.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="flex justify-center space-x-2 pt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-muted-foreground/20 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
    </motion.div>
  );
}
