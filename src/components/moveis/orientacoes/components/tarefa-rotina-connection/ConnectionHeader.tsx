
import { motion } from "framer-motion";
import { Link2, Zap } from "lucide-react";

interface ConnectionHeaderProps {
  title?: string;
  description?: string;
}

export function ConnectionHeader({ 
  title = "Conexão Rotina-Tarefa",
  description = "Relacionamento entre rotinas e tarefas do sistema"
}: ConnectionHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card-medium rounded-xl p-4 mb-4 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-purple-500/10 rounded-xl" />
      
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-xl animate-pulse opacity-50" />
      
      <div className="relative z-10 flex items-center gap-3">
        <div className="p-2 glass-button rounded-lg bg-primary/20 border border-primary/30">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground/90 gradient-text">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground/80">
            {description}
          </p>
        </div>
        
        <div className="p-2 glass-button rounded-lg bg-blue-500/10 border border-blue-400/20">
          <Zap className="h-4 w-4 text-blue-400" />
        </div>
      </div>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}
