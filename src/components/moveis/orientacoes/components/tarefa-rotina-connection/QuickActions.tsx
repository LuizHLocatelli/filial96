
import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface QuickActionsProps {
  rotinaId: string;
  onViewRotina?: (rotinaId: string) => void;
  onRefresh?: () => void;
}

export function QuickActions({ 
  rotinaId, 
  onViewRotina, 
  onRefresh
}: QuickActionsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="glass-card-medium rounded-xl p-4 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl" />
      
      <div className="relative z-10">
        <h5 className="text-sm font-medium text-foreground/90 mb-3">
          Ações Rápidas
        </h5>
        
        <div className="flex flex-wrap gap-2">
          {onViewRotina && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <GlassButton
                size="sm"
                variant="outline"
                onClick={() => onViewRotina(rotinaId)}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="h-3 w-3" />
                Ver Rotina
              </GlassButton>
            </motion.div>
          )}
          
          {onRefresh && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={onRefresh}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Atualizar
              </GlassButton>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </motion.div>
  );
}
