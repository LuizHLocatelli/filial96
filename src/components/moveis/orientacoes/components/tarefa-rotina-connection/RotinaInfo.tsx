
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User, Target } from "lucide-react";
import { RotinaWithStatus } from "../../../rotinas/types";

interface RotinaInfoProps {
  rotina: RotinaWithStatus;
}

export function RotinaInfo({ rotina }: RotinaInfoProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card rounded-xl p-4 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 rounded-xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
      
      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-lg gradient-text">
              {rotina.nome}
            </h4>
            <p className="text-sm text-muted-foreground/80 mt-1">
              {rotina.descricao}
            </p>
          </div>
          
          <Badge 
            variant={rotina.status === 'ativa' ? 'default' : 'secondary'}
            className="glass-button shadow-lg"
          >
            {rotina.status}
          </Badge>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card-medium rounded-lg p-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Frequência</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1">
              {rotina.frequencia}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card-medium rounded-lg p-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Última exec.</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1">
              {rotina.ultima_execucao 
                ? new Date(rotina.ultima_execucao).toLocaleDateString('pt-BR')
                : 'Nunca'
              }
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card-medium rounded-lg p-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Criado por</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1 truncate">
              {rotina.created_by}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card-medium rounded-lg p-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Prioridade</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1">
              {rotina.prioridade || 'Média'}
            </p>
          </motion.div>
        </div>

        {/* Progress indicator */}
        <div className="glass-card-medium rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status da Rotina</span>
            <span className="text-xs text-muted-foreground">
              {rotina.status === 'ativa' ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                rotina.status === 'ativa' 
                  ? "bg-gradient-to-r from-green-500 to-green-400 w-full" 
                  : "bg-gradient-to-r from-gray-400 to-gray-300 w-1/3"
              )}
            />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
    </motion.div>
  );
}
