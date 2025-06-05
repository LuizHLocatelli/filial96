
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
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const isMobile = useIsMobile();
  
  // Verificar se é tela muito pequena
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 360);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
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
          ? "bottom-6 left-4 right-4 flex justify-center" // Aumentado bottom de 4 para 6
          : "bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md"
      )}
    >
      {/* Container Glass Morphism Premium aprimorado */}
      <div className={cn(
        "relative overflow-hidden nav-glass-effect nav-glow",
        isMobile 
          ? cn(
              "rounded-3xl shadow-2xl shadow-black/20 ring-1 ring-white/30 w-full max-w-lg", // Mudado para rounded-3xl e max-w-lg
              isSmallScreen ? "px-3 py-4" : "px-4 py-5" // Aumentado padding
            )
          : "rounded-3xl px-5 py-4"
      )}>
        
        {/* Gradiente decorativo premium mais sutil */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        </div>
        
        {/* Container da navegação otimizado */}
        <div className={cn(
          "relative flex items-center",
          isMobile 
            ? cn(
                "justify-between gap-2 px-2", // Aumentado gap de 0.5 para 2
                isSmallScreen ? "gap-1 px-1" : "gap-2 px-2"
              )
            : "justify-around gap-1"
        )}>
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = selectedTab === index;
            
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabChange(index)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300", // Mudado para rounded-2xl
                  "group cursor-pointer select-none shrink-0",
                  isMobile 
                    ? cn(
                        "flex-1 min-w-0",
                        isSmallScreen 
                          ? "h-16 px-1 py-2" // Aumentado altura de 14 para 16
                          : "h-18 px-2 py-3" // Aumentado altura e padding
                      )
                    : "min-w-[56px] h-16 px-3 py-2.5",
                  isActive
                    ? "nav-tab-active scale-105 transform-gpu"
                    : "nav-tab-inactive hover:scale-[1.03] transform-gpu"
                )}
                whileTap={{ scale: 0.96 }}
                style={{
                  filter: isActive ? 'drop-shadow(0 4px 16px var(--nav-glow))' : 'none'
                }}
              >
                {/* Background do botão ativo aprimorado */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className={cn(
                      "absolute inset-0 rounded-2xl",
                      "bg-gradient-to-br from-primary/50 via-primary/35 to-primary/50",
                      "backdrop-blur-lg border border-primary/50",
                      "shadow-2xl shadow-primary/30",
                      "before:absolute before:inset-0 before:rounded-2xl",
                      "before:bg-primary/20 before:blur-xl before:-z-10"
                    )}
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Hover effect melhorado */}
                {!isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 transition-all duration-300",
                    "bg-gradient-to-br from-white/20 to-white/10 dark:from-white/15 dark:to-white/8",
                    "group-hover:opacity-100",
                    "border border-transparent group-hover:border-white/25 dark:group-hover:border-white/15",
                    "group-hover:shadow-xl group-hover:shadow-white/15"
                  )} />
                )}
                
                {/* Container do ícone otimizado */}
                <motion.div 
                  className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    isMobile 
                      ? cn(
                          "rounded-xl mb-2", // Aumentado margin bottom
                          isSmallScreen 
                            ? "w-6 h-6" // Aumentado tamanho do ícone
                            : "w-7 h-7"
                        )
                      : "rounded-lg w-8 h-8 mb-2",
                    isActive 
                      ? "bg-primary/30 shadow-xl shadow-primary/40 border border-primary/30" 
                      : "group-hover:bg-white/20 group-hover:shadow-xl group-hover:border group-hover:border-white/25"
                  )}
                  whileHover={{ scale: isMobile ? 1.08 : 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon 
                    className={cn(
                      "transition-all duration-300",
                      isMobile 
                        ? (isSmallScreen ? "h-4 w-4" : "h-4.5 w-4.5") // Aumentado tamanho dos ícones
                        : "h-4 w-4", 
                      isActive 
                        ? "nav-icon-active font-bold" 
                        : "nav-icon-inactive group-hover:font-medium",
                      !isActive && "text-gray-600 dark:text-gray-300"
                    )} 
                  />
                </motion.div>
                
                {/* Label com melhor tipografia */}
                <span className={cn(
                  "font-semibold transition-all duration-300 text-center leading-tight",
                  isMobile 
                    ? cn(
                        "px-1 truncate w-full",
                        isSmallScreen ? "text-[10px]" : "text-[11px]" // Aumentado tamanho da fonte
                      )
                    : "text-[11px]",
                  isActive 
                    ? "text-primary-foreground filter drop-shadow-sm font-bold" 
                    : "group-hover:text-foreground group-hover:drop-shadow-sm text-gray-600 dark:text-foreground/90 font-medium"
                )}>
                  {tab.title}
                </span>
                
                {/* Dot indicator premium apenas no desktop */}
                {!isMobile && isActive && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className={cn(
                      "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full", // Aumentado tamanho
                      "bg-gradient-to-br from-primary to-primary/90",
                      "border-2 border-background shadow-xl",
                      "shadow-primary/60",
                      "before:absolute before:inset-0 before:rounded-full",
                      "before:bg-primary/50 before:blur-md before:-z-10"
                    )}
                  />
                )}
                
                {/* Ripple effect */}
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
        
        {/* Indicador inferior para desktop */}
        {!isMobile && selectedTab !== null && (
          <motion.div
            layoutId="desktopIndicator"
            className={cn(
              "absolute bottom-0 h-2 rounded-full", // Aumentado altura
              "bg-gradient-to-r from-primary/60 via-primary to-primary/60",
              "shadow-2xl shadow-primary/60",
              "before:absolute before:inset-0 before:rounded-full",
              "before:bg-primary/40 before:blur-lg before:-z-10"
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
