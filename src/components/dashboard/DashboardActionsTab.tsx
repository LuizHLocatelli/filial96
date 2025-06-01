import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { ArrowRight } from "lucide-react";
import type { NavigateFunction } from "react-router-dom"; // Embora não use navigate diretamente, é parte da estrutura de QuickAction

// Precisa corresponder à definição em Dashboard.tsx ou ser importado de lá
export interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType; // LucideIcon ou similar
  action: () => void;
  gradient: string;
}

interface DashboardActionsTabProps {
  actions: QuickAction[];
  isMobile: boolean;
}

export function DashboardActionsTab({ actions, isMobile }: DashboardActionsTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ações Rápidas</h2>
      
      {/* Versão Horizontal Compacta */}
      <div className="w-full p-2 bg-background border rounded-lg">
        <ScrollArea className="w-full">
          <div className={`flex items-center gap-2 px-2 ${
            actions.length > 3 ? 'grid grid-cols-2 sm:flex sm:flex-wrap' : 'flex flex-wrap'
          }`}>
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <TooltipProvider key={action.title} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 sm:h-8 px-2 sm:px-3 flex items-center gap-2 text-xs font-medium justify-center sm:justify-start"
                        onClick={action.action}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs leading-tight">{action.title}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{action.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 