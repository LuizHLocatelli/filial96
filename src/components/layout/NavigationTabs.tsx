import { Home, Bell, Settings, Shield, User, Sofa, DollarSign, Image, Activity, Shirt } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  const tabs = [
    { title: "Hub", icon: Activity, path: "/" },
    { title: "Móveis", icon: Sofa, path: "/moveis" },
    { title: "Moda", icon: Shirt, path: "/moda" },
    { title: "Crediário", icon: DollarSign, path: "/crediario" },
    { title: "Cards", icon: Image, path: "/cards-promocionais" },
  ];
  
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => 
      'path' in tab && (currentPath === tab.path || currentPath.startsWith(`${tab.path}/`))
    );
    
    if (tabIndex !== -1) {
      setSelectedTab(tabIndex);
    }
  }, [location.pathname, tabs]);
  
  const handleTabChange = (index: number | null) => {
    setSelectedTab(index);
    if (index !== null && 'path' in tabs[index]) {
      const tabWithPath = tabs[index] as { path: string };
      navigate(tabWithPath.path);
    }
  };
  
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed z-50",
        isMobile 
          ? "bottom-0 left-0 right-0 pb-safe" 
          : "bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md"
      )}
    >
      {/* Container Glass Morphism Premium com classe personalizada */}
      <div className={cn(
        "relative overflow-hidden nav-glass-effect nav-glow",
        isMobile 
          ? "rounded-t-[2rem] px-4 py-5 border-b-0" 
          : "rounded-3xl px-5 py-4"
      )}>
        
        {/* Gradiente decorativo premium com mais intensidade */}
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-primary/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
        </div>
        
        {/* Container da navegação */}
        <div className={cn(
          "relative flex items-center justify-around gap-1",
          isMobile ? "pt-2" : ""
        )}>
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = selectedTab === index;
            
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabChange(index)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300",
                  "group cursor-pointer select-none",
                  isMobile 
                    ? "min-w-[68px] h-20 px-3 py-3" 
                    : "min-w-[56px] h-16 px-3 py-2.5",
                  // Usar classes personalizadas para estados
                  isActive
                    ? "nav-tab-active scale-110 transform-gpu"
                    : "nav-tab-inactive hover:scale-105 transform-gpu"
                )}
                whileTap={{ scale: 0.95 }}
                style={{
                  filter: isActive ? 'drop-shadow(0 6px 16px var(--nav-glow))' : 'none'
                }}
              >
                {/* Background do botão ativo com classe personalizada */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className={cn(
                      "absolute inset-0 rounded-2xl",
                      "bg-gradient-to-br from-primary/45 via-primary/30 to-primary/45",
                      "backdrop-blur-md border border-primary/60",
                      "shadow-inner shadow-primary/40",
                      "before:absolute before:inset-0 before:rounded-2xl",
                      "before:bg-primary/25 before:blur-lg before:-z-10"
                    )}
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Hover effect melhorado para não ativos */}
                {!isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 transition-all duration-300",
                    "bg-gradient-to-br from-white/25 to-white/15 dark:from-white/20 dark:to-white/10",
                    "group-hover:opacity-100",
                    "border border-transparent group-hover:border-white/30 dark:group-hover:border-white/20",
                    "group-hover:shadow-lg group-hover:shadow-white/20"
                  )} />
                )}
                
                {/* Container do ícone com melhor contraste */}
                <motion.div 
                  className={cn(
                    "relative flex items-center justify-center mb-2 transition-all duration-300",
                    "rounded-xl",
                    isMobile ? "w-9 h-9" : "w-8 h-8",
                    isActive 
                      ? "bg-primary/35 shadow-xl shadow-primary/50 border border-primary/40" 
                      : "group-hover:bg-white/25 group-hover:shadow-lg group-hover:border group-hover:border-white/30"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon 
                    className={cn(
                      "transition-all duration-300",
                      isMobile ? "h-5 w-5" : "h-4 w-4",
                      isActive 
                        ? "nav-icon-active font-bold" 
                        : "nav-icon-inactive group-hover:font-medium"
                    )} 
                  />
                </motion.div>
                
                {/* Label com melhor contraste */}
                <span className={cn(
                  "font-bold transition-all duration-300 text-center leading-tight",
                  "tracking-wide",
                  isMobile ? "text-xs" : "text-[11px]",
                  isActive 
                    ? "text-primary-foreground filter drop-shadow-md" 
                    : "text-foreground/95 group-hover:text-foreground group-hover:drop-shadow-sm"
                )}>
                  {tab.title}
                </span>
                
                {/* Dot indicator premium com melhor visibilidade */}
                {isMobile && isActive && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full",
                      "bg-gradient-to-br from-primary to-primary/90",
                      "border-2 border-background shadow-xl",
                      "shadow-primary/70",
                      "before:absolute before:inset-0 before:rounded-full",
                      "before:bg-primary/60 before:blur-sm before:-z-10"
                    )}
                  />
                )}
                
                {/* Ripple effect melhorado */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  whileTap={{
                    background: "radial-gradient(circle, var(--nav-glow) 0%, transparent 70%)"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            );
          })}
        </div>
        
        {/* Indicador inferior para desktop com melhor contraste */}
        {!isMobile && selectedTab !== null && (
          <motion.div
            layoutId="desktopIndicator"
            className={cn(
              "absolute bottom-0 h-1.5 rounded-full",
              "bg-gradient-to-r from-primary/70 via-primary to-primary/70",
              "shadow-xl shadow-primary/70",
              "before:absolute before:inset-0 before:rounded-full",
              "before:bg-primary/50 before:blur-md before:-z-10"
            )}
            style={{
              left: `${(selectedTab / tabs.length) * 100}%`,
              width: `${100 / tabs.length}%`,
            }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
          />
        )}
      </div>
    </motion.div>
  );
}
