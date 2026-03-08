import { Globe, BookOpen, FileText, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-wrap gap-1.5 mb-1.5">
      {tools.map((tool) => {
        const config = TOOL_CONFIG[tool];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <Badge
            key={tool}
            variant="outline"
            className={cn(
              "text-[11px] gap-1 py-0.5 px-2 font-medium",
              isStreaming && "animate-pulse border-primary/40 text-primary"
            )}
          >
            <Icon className="w-3 h-3" />
            {isStreaming ? config.activeLabel : config.label}
          </Badge>
        );
      })}
    </div>
  );
}
