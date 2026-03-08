import { Globe, BookOpen, FileText, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatToolBadgesProps {
  tools: string[];
  isStreaming?: boolean;
}

const TOOL_CONFIG: Record<string, { icon: typeof Globe; label: string; activeLabel: string }> = {
  web_search: { icon: Globe, label: "Busca na Web", activeLabel: "Buscando na web..." },
  rag: { icon: BookOpen, label: "Base de Conhecimento", activeLabel: "Consultando base..." },
  document_analysis: { icon: FileText, label: "Análise de Documento", activeLabel: "Analisando documento..." },
  image_generation: { icon: ImageIcon, label: "Geração de Imagem", activeLabel: "Gerando imagem..." },
};

export function ChatToolBadges({ tools, isStreaming = false }: ChatToolBadgesProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-0.5">
      {tools.map((tool) => {
        const config = TOOL_CONFIG[tool];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <motion.div
            key={tool}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] gap-1 py-0.5 px-2 font-medium rounded-lg",
                isStreaming 
                  ? "border-primary/30 text-primary bg-primary/5 shadow-sm shadow-primary/10" 
                  : "text-muted-foreground/70 border-border/50"
              )}
            >
              <Icon className={cn("w-3 h-3", isStreaming && "animate-pulse")} />
              {isStreaming ? config.activeLabel : config.label}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}
