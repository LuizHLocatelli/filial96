import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ListTodo, Users, PiggyBank, Calendar, FolderArchive } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickAccessProps {
  onNavigate: (tab: string) => void;
  compact?: boolean;
  variant?: "default" | "horizontal" | "minimal";
}

interface AccessCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
  darkBgColor: string;
  hoverColor: string;
  darkHoverColor: string;
  compact?: boolean;
}

const AccessCard = ({ 
  title, 
  icon, 
  onClick, 
  bgColor, 
  darkBgColor, 
  hoverColor, 
  darkHoverColor, 
  compact = false 
}: AccessCardProps) => {
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      className={`${isDarkMode ? darkBgColor : bgColor} rounded-xl flex flex-col items-center justify-center 
        cursor-pointer transition-all duration-300 ${compact 
          ? isMobile ? 'p-3 h-20' : 'p-2 h-16 sm:h-20'
          : 'p-3 h-28 sm:h-36'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`${isDarkMode ? darkHoverColor : hoverColor} ${compact 
        ? isMobile ? 'p-2 mb-2' : 'p-1.5 mb-1'
        : 'p-2 sm:p-3 mb-2 sm:mb-3'} rounded-full`}
      >
        {icon}
      </div>
      <span className={`font-medium text-center ${compact 
        ? isMobile ? 'text-sm' : 'text-xs' 
        : 'text-base sm:text-lg'} ${isDarkMode ? 'text-white' : 'text-green-800'}`}
      >
        {title}
      </span>
    </motion.div>
  );
};

export const QuickAccess = ({ onNavigate, compact = false, variant = "horizontal" }: QuickAccessProps) => {
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  
  const handleNavigation = useCallback(
    (tab: string) => {
      onNavigate(tab);
    },
    [onNavigate]
  );

  const iconSize = compact ? (isMobile ? 20 : 18) : 24;

  const quickAccessItems = [
    {
      title: "Listagens",
      icon: <ListTodo size={iconSize} className={isDarkMode ? "text-green-300" : "text-green-700"} />,
      onClick: () => handleNavigation("listagens"),
      bgColor: "bg-green-100",
      darkBgColor: "bg-green-900/40",
      hoverColor: "bg-green-200",
      darkHoverColor: "bg-green-800/60"
    },
    {
      title: "Clientes",
      icon: <Users size={iconSize} className={isDarkMode ? "text-blue-300" : "text-blue-700"} />,
      onClick: () => handleNavigation("clientes"),
      bgColor: "bg-blue-100",
      darkBgColor: "bg-blue-900/40",
      hoverColor: "bg-blue-200",
      darkHoverColor: "bg-blue-800/60"
    },
    {
      title: "Depósitos",
      icon: <PiggyBank size={iconSize} className={isDarkMode ? "text-purple-300" : "text-purple-700"} />,
      onClick: () => handleNavigation("depositos"),
      bgColor: "bg-purple-100",
      darkBgColor: "bg-purple-900/40",
      hoverColor: "bg-purple-200",
      darkHoverColor: "bg-purple-800/60"
    },
    {
      title: "Folgas",
      icon: <Calendar size={iconSize} className={isDarkMode ? "text-orange-300" : "text-orange-700"} />,
      onClick: () => handleNavigation("folgas"),
      bgColor: "bg-orange-100",
      darkBgColor: "bg-orange-900/40",
      hoverColor: "bg-orange-200",
      darkHoverColor: "bg-orange-800/60"
    },
    {
      title: "Diretório",
      icon: <FolderArchive size={iconSize} className={isDarkMode ? "text-cyan-300" : "text-cyan-700"} />,
      onClick: () => handleNavigation("diretorio"),
      bgColor: "bg-cyan-100",
      darkBgColor: "bg-cyan-900/40",
      hoverColor: "bg-cyan-200",
      darkHoverColor: "bg-cyan-800/60"
    }
  ];

  // Variante Horizontal Compacta
  if (variant === "horizontal") {
    return (
      <div className="w-full p-2 bg-background border rounded-lg">
        <ScrollArea className="w-full">
          <div className="flex items-center space-x-2 px-2">
            {quickAccessItems.map((item) => (
              <TooltipProvider key={item.title} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 flex items-center gap-2 whitespace-nowrap"
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span className="text-xs">{item.title}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Acessar {item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Variante Mínima (apenas ícones)
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center gap-1 p-2 bg-background border rounded-lg">
        {quickAccessItems.map((item) => (
          <TooltipProvider key={item.title} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md"
                  onClick={item.onClick}
                  aria-label={item.title}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  // Variante Default (original)
  return (
    <div className={compact ? "" : "animate-fade-in"}>
      {!compact && (
        <div className={`text-center ${isMobile ? 'mb-4' : 'mb-6 sm:mb-8'}`}>
          <h2 className={`font-bold text-green-800 dark:text-green-300 ${
            isMobile ? 'text-lg' : 'text-xl sm:text-2xl'
          }`}>
            Acesso Rápido
          </h2>
          <p className={`text-green-700 dark:text-green-400 ${
            isMobile ? 'text-xs' : 'text-sm sm:text-base'
          }`}>
            Selecione uma opção para começar
          </p>
        </div>
      )}
      
      <div className={`grid ${compact ? 'grid-cols-3 sm:grid-cols-5 gap-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'} 
        ${compact ? 'max-w-full' : 'max-w-4xl mx-auto'}`}
      >
        {quickAccessItems.map((item) => (
          <AccessCard
            key={item.title}
            title={item.title}
            icon={item.icon}
            onClick={item.onClick}
            bgColor={item.bgColor}
            darkBgColor={item.darkBgColor}
            hoverColor={item.hoverColor}
            darkHoverColor={item.darkHoverColor}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};
