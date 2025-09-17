import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalculatorTheme } from "./CalculatorThemeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CalculatorThemeToggle() {
  const { isDarkMode, toggleTheme } = useCalculatorTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
