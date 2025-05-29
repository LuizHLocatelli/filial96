import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabConfig {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
  component: ReactNode;
  mobileLabel?: string; // Label alternativo para mobile
}

interface PageNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (value: string) => void;
  variant?: "tabs" | "cards" | "minimal";
  className?: string;
  maxColumns?: 2 | 3 | 4 | 5;
}

export function PageNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = "tabs",
  className,
  maxColumns = 3
}: PageNavigationProps) {
  const currentTab = tabs.find(tab => tab.value === activeTab) || tabs[0];
  const isMobile = useIsMobile();
  
  // Função para obter o label apropriado para mobile
  const getDisplayLabel = (tab: TabConfig) => {
    if (isMobile && tab.mobileLabel) {
      return tab.mobileLabel;
    }
    if (isMobile && tab.label.length > 10) {
      // Se o label for muito longo no mobile, encurta automaticamente
      return tab.label.split(' ')[0];
    }
    return tab.label;
  };

  if (variant === "cards") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Navigation Cards */}
        <div className={cn(
          "grid gap-3 lg:gap-4 max-w-4xl mx-auto",
          maxColumns === 2 && "grid-cols-2",
          maxColumns === 3 && "grid-cols-3",
          maxColumns === 4 && "grid-cols-2 sm:grid-cols-4",
          maxColumns === 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        )}>
          {tabs.map((tab) => (
            <Card 
              key={tab.value}
              className={cn(
                "cursor-pointer transition-all duration-200 shadow-soft hover:shadow-md",
                activeTab === tab.value 
                  ? "ring-2 ring-primary bg-primary/5" 
                  : "bg-muted/30 border hover:bg-accent/50"
              )}
              onClick={() => onTabChange(tab.value)}
            >
              <CardContent className="p-3 lg:p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  {tab.icon && (
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      activeTab === tab.value 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      <tab.icon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm truncate">{getDisplayLabel(tab)}</h3>
                    {tab.description && (
                      <p className="text-xs text-muted-foreground hidden sm:block truncate">
                        {tab.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Tab Content */}
        <div className="space-y-4">
          {currentTab.component}
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "flex items-center gap-2",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {getDisplayLabel(tab)}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {currentTab.component}
        </div>
      </div>
    );
  }

  // Default tabs variant
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={cn("space-y-3", className)}>
      <TabsList className={cn(
        "grid w-full",
        tabs.length === 2 && "grid-cols-2",
        tabs.length === 3 && "grid-cols-3",
        tabs.length === 4 && "grid-cols-2 sm:grid-cols-4",
        tabs.length > 4 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      )}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            {tab.icon && <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
            <span className="truncate">{getDisplayLabel(tab)}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4">
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
} 