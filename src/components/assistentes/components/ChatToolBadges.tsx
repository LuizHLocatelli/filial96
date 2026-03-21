import { Globe, BookOpen, FileText, ImageIcon, CheckCircle2, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatToolBadgesProps {
  tools: string[];
  isStreaming?: boolean;
  isGeneratingText?: boolean;
  showDetails?: boolean;
}

const TOOL_CONFIG: Record<string, { icon: typeof Globe; label: string; activeLabel: string; color: string }> = {
  web_search: { icon: Globe, label: "Busca na Web", activeLabel: "Buscando na web…", color: "blue" },
  rag: { icon: BookOpen, label: "Base de Conhecimento", activeLabel: "Consultando base…", color: "amber" },
  document_analysis: { icon: FileText, label: "Análise de Documento", activeLabel: "Analisando documento…", color: "orange" },
  image_generation: { icon: ImageIcon, label: "Geração de Imagem", activeLabel: "Gerando imagem…", color: "violet" },
  database: { icon: Database, label: "Banco de Dados", activeLabel: "Consultando banco…", color: "cyan" },
};

const colorMap: Record<string, {
  bg: string; bgActive: string; border: string; borderActive: string;
  text: string; textActive: string; dot: string; ring: string;
}> = {
  blue: {
    bg: "bg-blue-50/80 dark:bg-blue-950/30", bgActive: "bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/30",
    border: "border-blue-200/60 dark:border-blue-800/40", borderActive: "border-blue-300 dark:border-blue-700/60",
    text: "text-blue-700 dark:text-blue-300", textActive: "text-blue-600 dark:text-blue-300",
    dot: "bg-blue-500", ring: "ring-blue-400/30",
  },
  amber: {
    bg: "bg-amber-50/80 dark:bg-amber-950/30", bgActive: "bg-gradient-to-r from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/30",
    border: "border-amber-200/60 dark:border-amber-800/40", borderActive: "border-amber-300 dark:border-amber-700/60",
    text: "text-amber-700 dark:text-amber-300", textActive: "text-amber-600 dark:text-amber-300",
    dot: "bg-amber-500", ring: "ring-amber-400/30",
  },
  orange: {
    bg: "bg-orange-50/80 dark:bg-orange-950/30", bgActive: "bg-gradient-to-r from-orange-50 to-orange-100/80 dark:from-orange-950/40 dark:to-orange-900/30",
    border: "border-orange-200/60 dark:border-orange-800/40", borderActive: "border-orange-300 dark:border-orange-700/60",
    text: "text-orange-700 dark:text-orange-300", textActive: "text-orange-600 dark:text-orange-300",
    dot: "bg-orange-500", ring: "ring-orange-400/30",
  },
  violet: {
    bg: "bg-violet-50/80 dark:bg-violet-950/30", bgActive: "bg-gradient-to-r from-violet-50 to-violet-100/80 dark:from-violet-950/40 dark:to-violet-900/30",
    border: "border-violet-200/60 dark:border-violet-800/40", borderActive: "border-violet-300 dark:border-violet-700/60",
    text: "text-violet-700 dark:text-violet-300", textActive: "text-violet-600 dark:text-violet-300",
    dot: "bg-violet-500", ring: "ring-violet-400/30",
  },
  cyan: {
    bg: "bg-cyan-50/80 dark:bg-cyan-950/30", bgActive: "bg-gradient-to-r from-cyan-50 to-cyan-100/80 dark:from-cyan-950/40 dark:to-cyan-900/30",
    border: "border-cyan-200/60 dark:border-cyan-800/40", borderActive: "border-cyan-300 dark:border-cyan-700/60",
    text: "text-cyan-700 dark:text-cyan-300", textActive: "text-cyan-600 dark:text-cyan-300",
    dot: "bg-cyan-500", ring: "ring-cyan-400/30",
  },
};

export function ChatToolBadges({ tools, isStreaming = false, isGeneratingText = false, showDetails = false }: ChatToolBadgesProps) {
  if (!tools || tools.length === 0) return null;

  if (isStreaming) {
    return (
      <div className="flex flex-col gap-1.5 w-full max-w-[240px] xs:max-w-[280px] sm:max-w-[360px] mb-2 mt-1 min-w-0 overflow-hidden">
        <AnimatePresence>
          {tools.map((tool, index) => {
            const config = TOOL_CONFIG[tool] || { icon: Sparkles, label: "Processando", activeLabel: "Processando…", color: "blue" };
            const Icon = config.icon;
            const colors = colorMap[config.color] || colorMap.blue;

            const isCompleted = isGeneratingText || index < tools.length - 1;
            const isActive = !isCompleted;

            return (
              <motion.div
                key={tool}
                initial={{ opacity: 0, height: 0, x: -12 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, x: -8 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8,
                }}
                layout
                className="overflow-hidden"
              >
                <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl border relative overflow-hidden transition-all duration-500",
                  isActive
                    ? `${colors.bgActive} ${colors.borderActive} ring-2 ${colors.ring}`
                    : `${colors.bg} ${colors.border}`
                )}>
                  {/* Subtle shimmer for active tool */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12"
                      animate={{ x: ['-150%', '250%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}

                  {/* Icon container */}
                  <div className="relative z-10 shrink-0">
                    {isActive ? (
                      <div className="relative">
                        {/* Spinning ring */}
                        <motion.div
                          className={cn("absolute -inset-1 rounded-full border-2 border-transparent", `border-t-current`, colors.textActive)}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          style={{ opacity: 0.5 }}
                        />
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          colors.bgActive
                        )}>
                          <Icon className={cn("w-3.5 h-3.5", colors.textActive)} />
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0 relative z-10 flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-[12.5px] font-medium truncate block leading-tight",
                      isActive ? colors.textActive : "text-muted-foreground"
                    )}>
                      {isActive ? config.activeLabel : config.label}
                    </span>

                    {/* Animated dots for active state */}
                    {isActive && !showDetails && (
                      <div className="flex items-center gap-[3px] shrink-0 pr-0.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className={cn("w-[4px] h-[4px] rounded-full", colors.dot)}
                            animate={{
                              opacity: [0.25, 0.9, 0.25],
                              scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut",
                            }}
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

  // Static / completed badges (for saved messages)
  return (
    <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
      {tools.map((tool, index) => {
        const config = TOOL_CONFIG[tool] || { icon: Sparkles, label: "Processamento", activeLabel: "Processado", color: "blue" };
        const colors = colorMap[config.color] || colorMap.blue;

        return (
          <motion.div
            key={tool}
            initial={{ opacity: 0, scale: 0.85, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium",
              colors.bg, colors.border, colors.text
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
