import { Wrench } from "@/components/ui/emoji-icons";
import { InternalTool } from "@/types/painel-regiao";
import { ToolCard } from "./ToolCard";

interface ToolsSectionProps {
  tools: InternalTool[];
}

export const ToolsSection = ({ tools }: ToolsSectionProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Ferramentas da Região
        </h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};
