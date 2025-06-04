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
  
  // Títulos completos mantidos - sem abreviações
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
      {/* Container Glass Morphism Premium com classes personalizadas */}
      <div className={cn(
        "relative overflow-hidden nav-glass-effect nav-glow",
        isMobile 
          ? "rounded-t-[1.5rem] px-1 py-2.5 border-b-0" // Padding horizontal e vertical reduzidos
          : "rounded-3xl px-5 py-4"
      )}>
        
        {/* Gradiente decorativo premium com mais intensidade */}
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-primary/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
        </div>
        
        {/* Container da navegação - melhorado para mobile */}
        <div className={cn(
          "relative flex items-center",
          isMobile 
            ? "justify-center gap-7" // Gap ligeiramente maior para ajuste final
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
                  "relative flex flex-col items-center justify-center rounded-xl transition-all duration-300",
                  "group cursor-pointer select-none shrink-0", // shrink-0 para evitar compressão
                  isMobile 
                    ? "w-[76px] h-16 px-3.5 py-2" // Largura e padding extremos
                    : "min-w-[56px] h-16 px-3 py-2.5",
                  // Usar classes personalizadas para estados
                  isActive
                    ? "nav-tab-active scale-105 transform-gpu" // Scale reduzido para mobile
                    : "nav-tab-inactive hover:scale-102 transform-gpu"
                )}
                whileTap={{ scale: 0.95 }}
                style={{
                  filter: isActive ? 'drop-shadow(0 4px 12px var(--nav-glow))' : 'none'
                }}
              >
                {/* Background do botão ativo com classe personalizada */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className={cn(
                      "absolute inset-0 rounded-xl", // rounded-xl para mobile
                      "bg-gradient-to-br from-primary/45 via-primary/30 to-primary/45",
                      "backdrop-blur-md border border-primary/60",
                      "shadow-inner shadow-primary/40",
                      "before:absolute before:inset-0 before:rounded-xl",
                      "before:bg-primary/25 before:blur-lg before:-z-10"
                    )}
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Hover effect melhorado para não ativos */}
                {!isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 transition-all duration-300",
                    "bg-gradient-to-br from-white/25 to-white/15 dark:from-white/20 dark:to-white/10",
                    "group-hover:opacity-100",
                    "border border-transparent group-hover:border-white/30 dark:group-hover:border-white/20",
                    "group-hover:shadow-lg group-hover:shadow-white/20"
                  )} />
                )}
                
                {/* Container do ícone com melhor contraste - otimizado para mobile */}
                <motion.div 
                  className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    "rounded-lg", // rounded-lg para mobile
                    isMobile 
                      ? "w-6 h-6 mb-1" // Ícones ainda menores para dar espaço aos textos
                      : "w-8 h-8 mb-2",
                    isActive 
                      ? "bg-primary/35 shadow-lg shadow-primary/50 border border-primary/40" 
                      : "group-hover:bg-white/25 group-hover:shadow-lg group-hover:border group-hover:border-white/30"
                  )}
                  whileHover={{ scale: 1.05 }} // Scale reduzido para mobile
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon 
                    className={cn(
                      "transition-all duration-300",
                      isMobile ? "h-3.5 w-3.5" : "h-4 w-4", // Ícones menores para dar espaço ao texto
                      isActive 
                        ? "nav-icon-active font-bold" 
                        : "nav-icon-inactive group-hover:font-medium",
                      // Melhor contraste para modo claro
                      !isActive && "text-gray-700 dark:text-gray-300"
                    )} 
                  />
                </motion.div>
                
                {/* Label com melhor contraste e responsividade aprimorada */}
                <span className={cn(
                  "font-semibold transition-all duration-300 text-center leading-tight",
                  "tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap", // Melhor handling de overflow
                  isMobile 
                    ? "text-[9px] max-w-full" // Fonte menor para acomodar nomes completos
                    : "text-[11px]",
                  isActive 
                    ? "text-primary-foreground filter drop-shadow-sm" 
                    : cn(
                        "group-hover:text-foreground group-hover:drop-shadow-sm",
                        // Melhor contraste para modo claro
                        "text-gray-700 dark:text-foreground/95"
                      )
                )}>
                  {/* Usa título completo sempre */}
                  {tab.title}
                </span>
                
                {/* Dot indicator premium com melhor visibilidade - ajustado para mobile */}
                {isMobile && isActive && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full", // Tamanho reduzido
                      "bg-gradient-to-br from-primary to-primary/90",
                      "border border-background shadow-lg", // Shadow reduzido
                      "shadow-primary/70",
                      "before:absolute before:inset-0 before:rounded-full",
                      "before:bg-primary/60 before:blur-sm before:-z-10"
                    )}
                  />
                )}
                
                {/* Ripple effect melhorado */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
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
