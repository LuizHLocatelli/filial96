
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ListTodo, Users, PiggyBank, Calendar, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface QuickAccessProps {
  onNavigate: (tab: string) => void;
  compact?: boolean;
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
  
  return (
    <motion.div
      className={`${isDarkMode ? darkBgColor : bgColor} rounded-xl flex flex-col items-center justify-center 
        cursor-pointer transition-all duration-300 ${compact 
          ? 'p-2 h-16 sm:h-20' 
          : 'p-3 h-28 sm:h-36'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`${isDarkMode ? darkHoverColor : hoverColor} ${compact 
        ? 'p-1 sm:p-2 mb-1 sm:mb-1' 
        : 'p-2 sm:p-3 mb-2 sm:mb-3'} rounded-full`}
      >
        {icon}
      </div>
      <span className={`font-medium ${compact 
        ? 'text-xs sm:text-sm' 
        : 'text-base sm:text-lg'} ${isDarkMode ? 'text-white' : 'text-green-800'}`}
      >
        {title}
      </span>
    </motion.div>
  );
};

export const QuickAccess = ({ onNavigate, compact = false }: QuickAccessProps) => {
  const { isDarkMode } = useTheme();
  
  const handleNavigation = useCallback(
    (tab: string) => {
      onNavigate(tab);
    },
    [onNavigate]
  );

  const iconSize = compact ? 18 : 24;

  return (
    <div className={compact ? "" : "animate-fade-in"}>
      {!compact && (
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">Acesso Rápido</h2>
          <p className="text-sm sm:text-base text-green-700 dark:text-green-400">Selecione uma opção para começar</p>
        </div>
      )}
      
      <div className={`grid grid-cols-${compact ? '5' : '2'} md:grid-cols-${compact ? '5' : '3'} lg:grid-cols-${compact ? '5' : '4'} 
        gap-${compact ? '2' : '3'} sm:gap-${compact ? '3' : '4'} 
        ${compact ? 'max-w-full' : 'max-w-4xl mx-auto'}`}
      >
        <AccessCard
          title="Listagens"
          icon={<ListTodo size={iconSize} className={isDarkMode ? "text-green-300" : "text-green-700"} />}
          onClick={() => handleNavigation("listagens")}
          bgColor="bg-green-100"
          darkBgColor="bg-green-900/30"
          hoverColor="bg-green-200"
          darkHoverColor="bg-green-800/50"
          compact={compact}
        />
        
        <AccessCard
          title="Clientes"
          icon={<Users size={iconSize} className={isDarkMode ? "text-blue-300" : "text-blue-700"} />}
          onClick={() => handleNavigation("clientes")}
          bgColor="bg-blue-100"
          darkBgColor="bg-blue-900/30"
          hoverColor="bg-blue-200"
          darkHoverColor="bg-blue-800/50"
          compact={compact}
        />
        
        <AccessCard
          title="Depósitos"
          icon={<PiggyBank size={iconSize} className={isDarkMode ? "text-purple-300" : "text-purple-700"} />}
          onClick={() => handleNavigation("depositos")}
          bgColor="bg-purple-100"
          darkBgColor="bg-purple-900/30"
          hoverColor="bg-purple-200"
          darkHoverColor="bg-purple-800/50"
          compact={compact}
        />
        
        <AccessCard
          title="Folgas"
          icon={<Calendar size={iconSize} className={isDarkMode ? "text-orange-300" : "text-orange-700"} />}
          onClick={() => handleNavigation("folgas")}
          bgColor="bg-orange-100"
          darkBgColor="bg-orange-900/30"
          hoverColor="bg-orange-200"
          darkHoverColor="bg-orange-800/50"
          compact={compact}
        />
        
        <AccessCard
          title="Quadro"
          icon={<LayoutDashboard size={iconSize} className={isDarkMode ? "text-yellow-300" : "text-yellow-700"} />}
          onClick={() => handleNavigation("kanban")}
          bgColor="bg-yellow-100"
          darkBgColor="bg-yellow-900/30"
          hoverColor="bg-yellow-200"
          darkHoverColor="bg-yellow-800/50"
          compact={compact}
        />
      </div>
    </div>
  );
};
