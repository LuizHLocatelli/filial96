import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InternalTool } from "@/types/painel-regiao";

interface ToolCardProps {
  tool: InternalTool;
}

export const ToolCard = memo(({ tool }: ToolCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(tool.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className="glass-card cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Acessar ${tool.title}`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* Ícone */}
          <div className={cn(
            "p-2.5 rounded-lg bg-primary/10 border border-primary/20 w-fit",
            tool.iconColor
          )}>
            <tool.icon className="h-5 w-5" />
          </div>

          {/* Conteúdo */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
              {tool.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
