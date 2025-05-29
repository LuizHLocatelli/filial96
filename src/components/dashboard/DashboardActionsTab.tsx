import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Card 
          key={index} 
          className="cursor-pointer transition-all duration-300 border shadow-soft hover:shadow-strong hover:-translate-y-2 group"
          onClick={action.action}
        >
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {action.title}
                </h3>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {action.description}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto font-medium group-hover:text-primary">
                Acessar
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 