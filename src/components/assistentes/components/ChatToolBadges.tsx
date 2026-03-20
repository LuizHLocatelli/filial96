import { Globe, BookOpen, FileText, ImageIcon, Loader2, CheckCircle2, Sparkles, Database, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatToolBadgesProps {
  tools: string[];
  isStreaming?: boolean;
  isGeneratingText?: boolean;
  showDetails?: boolean;
}

const TOOL_CONFIG: Record<string, { icon: typeof Globe; label: string; activeLabel: string; color: string }> = {
  web_search: { icon: Globe, label: "Busca na Web", activeLabel: "Buscando na web...", color: "blue" },
  rag: { icon: BookOpen, label: "Base de Conhecimento", activeLabel: "Consultando base...", color: "amber" },
  document_analysis: { icon: FileText, label: "Análise de Documento", activeLabel: "Analisando documento...", color: "orange" },
  image_generation: { icon: ImageIcon, label: "Geração de Imagem", activeLabel: "Gerando imagem...", color: "purple" },
  database: { icon: Database, label: "Banco de Dados", activeLabel: "Consultando banco...", color: "cyan" },
};

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; dot: string }> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400", glow: "shadow-blue-500/20", dot: "bg-blue-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", glow: "shadow-amber-500/20", dot: "bg-amber-500" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600 dark:text-orange-400", glow: "shadow-orange-500/20", dot: "bg-orange-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600 dark:text-purple-400", glow: "shadow-purple-500/20", dot: "bg-purple-500" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-600 dark:text-cyan-400", glow: "shadow-cyan-500/20", dot: "bg-cyan-500" },
};

export function ChatToolBadges({ tools, isStreaming = false, isGeneratingText = false, showDetails = false }: ChatToolBadgesProps) {
  if (!tools || tools.length === 0) return null;

  if (isStreaming) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[320px] mb-2 mt-1 min-w-0 overflow-hidden">
        <AnimatePresence>
          {tools.map((tool, index) => {
            const config = TOOL_CONFIG[tool] || { icon: Sparkles, label: "Processando", activeLabel: "Processando...", color: "blue" };
            const Icon = config.icon;
            const colors = colorMap[config.color] || colorMap.blue;
            
            const isCompleted = isGeneratingText || index < tools.length - 1;
            const isActive = !isCompleted;

            return (
              <motion.div
                key={tool}
                initial={{ opacity: 0, height: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                layout
                className="overflow-hidden"
              >
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 rounded-xl border backdrop-blur-sm relative overflow-hidden transition-all duration-300",
                  isActive 
                    ? `${colors.bg} ${colors.border} shadow-sm ${colors.glow}` 
                    : "bg-muted/40 border-border/50"
                )}>
                  {/* Animated glow for active tool */}
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 relative z-10 transition-all duration-300",
                    isActive 
                      ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-sm` 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className={cn("w-4 h-4", colors.text)} />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 relative z-10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isActive && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-current shrink-0"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      <span className={cn(
                        "text-[13px] font-medium truncate block",
                        isActive ? colors.text : "text-muted-foreground"
                      )}>
                        {isActive ? config.activeLabel : config.label}
                      </span>
                    </div>
                    
                    {isActive && !showDetails && (
                      <div className="flex items-center gap-1 shrink-0">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className={cn("w-1.5 h-1.5 rounded-full", colors.dot, "opacity-60")}
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2 mt-1">
      {tools.map((tool, index) => {
        const config = TOOL_CONFIG[tool] || { icon: Sparkles, label: "Processamento", activeLabel: "Processado", color: "blue" };
        const colors = colorMap[config.color] || colorMap.blue;

        return (
          <motion.div
            key={tool}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-sm",
              colors.bg,
              colors.border,
              colors.text
            )}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {config.label}
          </motion.div>
        );
      })}
    </div>
  );
}
