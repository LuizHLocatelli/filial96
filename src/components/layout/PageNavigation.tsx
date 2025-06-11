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
    if (isMobile && tab.label.length > 10 && tab.label !== 'Painel de Metas') {
      // Se o label for muito longo no mobile, encurta automaticamente, exceto para "Painel de Metas"
      return tab.label.split(' ')[0];
    }
    return tab.label;
  };

  if (variant === "cards") {
    // Se há mais de 4 itens, usa versão horizontal compacta
    if (tabs.length > 4) {
      return (
        <div className={cn("space-y-4", className)}>
          {/* Navigation Compact - Layout otimizado para mobile */}
          <div className="w-full p-3 bg-gradient-to-r from-background to-accent/5 border rounded-xl shadow-sm">
            <div className={cn(
              "gap-2",
              // Grid inteligente baseado na quantidade de itens
              isMobile 
                ? tabs.length === 5 ? "grid grid-cols-3" 
                  : tabs.length === 6 ? "grid grid-cols-3" 
                  : tabs.length > 6 ? "grid grid-cols-2" 
                  : "flex flex-wrap justify-center"
                : "flex flex-wrap justify-center",
              // No desktop: Uma linha com scroll se necessário
              !isMobile && tabs.length > 8 && "overflow-x-auto"
            )}>
              {tabs.map((tab, index) => (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 rounded-xl transition-all duration-200 border animate-fade-in-up",
                    // Tamanhos e espaçamentos otimizados
                    isMobile 
                      ? "h-16 px-2 py-2" 
                      : "h-12 px-3 py-2 flex-row gap-2",
                    // Estados visuais melhorados
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                      : "bg-card hover:bg-accent/80 border-border/50 hover:border-border hover:shadow-md hover:scale-102"
                  )}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {tab.icon && (
                    <div className={cn(
                      "flex items-center justify-center rounded-lg transition-all duration-200",
                      isMobile ? "w-6 h-6" : "w-5 h-5",
                      activeTab === tab.value
                        ? "bg-primary-foreground/20"
                        : "group-hover:bg-accent"
                    )}>
                      <tab.icon className={cn(
                        "transition-all duration-200",
                        isMobile ? "h-4 w-4" : "h-4 w-4",
                        activeTab === tab.value 
                          ? "text-primary-foreground" 
                          : "text-muted-foreground group-hover:text-foreground"
                      )} />
                    </div>
                  )}
                  <span className={cn(
                    "font-medium transition-all duration-200 text-center leading-tight",
                    isMobile ? "text-[10px]" : "text-xs",
                    activeTab === tab.value 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {getDisplayLabel(tab)}
                  </span>
                  
                  {/* Indicador visual para aba ativa */}
                  {activeTab === tab.value && (
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Tab Content */}
          <div className="space-y-4">
            {currentTab.component}
          </div>
        </div>
      );
    }

    // Versão cards original para 4 ou menos itens
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