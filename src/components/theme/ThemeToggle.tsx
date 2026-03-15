
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300",
              "bg-zinc-950/5 dark:bg-zinc-950/20 hover:bg-zinc-950/10 dark:hover:bg-zinc-950/40",
              "text-[16px]"
            )}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
