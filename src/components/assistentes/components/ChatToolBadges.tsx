import { Globe, BookOpen, FileText, ImageIcon, Loader2, CheckCircle2, Sparkles, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatToolBadgesProps {
  tools: string[];
  isStreaming?: boolean;
  isGeneratingText?: boolean;
}

const TOOL_CONFIG: Record<string, { icon: typeof Globe; label: string; activeLabel: string }> = {
  web_search: { icon: Globe, label: "Busca na Web", activeLabel: "Buscando na web..." },
  rag: { icon: BookOpen, label: "Base de Conhecimento", activeLabel: "Consultando base..." },
  document_analysis: { icon: FileText, label: "Análise de Documento", activeLabel: "Analisando documento..." },
  image_generation: { icon: ImageIcon, label: "Geração de Imagem", activeLabel: "Gerando imagem..." },
  database: { icon: Database, label: "Banco de Dados", activeLabel: "Consultando banco de dados..." },
};

export function ChatToolBadges({ tools, isStreaming = false, isGeneratingText = false }: ChatToolBadgesProps) {
  if (!tools || tools.length === 0) return null;

  if (isStreaming) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-[280px] sm:max-w-[320px] mb-2 mt-1">
        <AnimatePresence>
          {tools.map((tool, index) => {
            const config = TOOL_CONFIG[tool] || { icon: Sparkles, label: "Processando", activeLabel: "Processando..." };
            const Icon = config.icon;
            
            // If we are generating text, ALL tools are complete
            // Otherwise, only the last tool is active
            const isCompleted = isGeneratingText || index < tools.length - 1;
            const isActive = !isCompleted;

            return (
              <motion.div
                key={tool}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm relative overflow-hidden transition-all duration-300",
                  isActive 
                    ? "bg-primary/5 border-primary/20 shadow-sm" 
                    : "bg-muted/40 border-border/50 text-muted-foreground/80"
                )}>
                  {/* Active Tool animated glow */}
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full shrink-0 relative z-10 transition-colors duration-300",
                    isActive ? "bg-background text-primary shadow-sm ring-1 ring-primary/20" : "bg-muted text-muted-foreground"
                  )}>
                    {isActive ? (
                      <Icon className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 relative z-10 flex items-center justify-between">
                    <span className={cn(
                      "text-[13px] font-medium truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {isActive ? config.activeLabel : config.label}
                    </span>
                    
                    {isActive && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/70 shrink-0 ml-2" />
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

  // Finished state (historical messages)
  return (
    <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
      {tools.map((tool) => {
        const config = TOOL_CONFIG[tool] || { icon: Sparkles, label: "Processamento", activeLabel: "Processado" };
        const Icon = config.icon;

        return (
          <Badge
            key={tool}
            variant="outline"
            className="text-[10px] gap-1.5 py-0.5 px-2 font-medium rounded-md text-muted-foreground/80 border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors cursor-default"
          >
            <Icon className="w-3 h-3 text-muted-foreground/60" />
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
}
