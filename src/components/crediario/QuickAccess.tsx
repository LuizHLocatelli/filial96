
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ListTodo, Users, PiggyBank, Calendar, FolderArchive } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";

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

export const QuickAccess = ({ onNavigate, compact = false }: QuickAccessProps) => {
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  
  const handleNavigation = useCallback(
    (tab: string) => {
      onNavigate(tab);
    },
    [onNavigate]
  );

  const iconSize = compact ? (isMobile ? 20 : 18) : 24;

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
        <AccessCard
          title="Listagens"
          icon={<ListTodo size={iconSize} className={isDarkMode ? "text-green-300" : "text-green-700"} />}
          onClick={() => handleNavigation("listagens")}
          bgColor="bg-green-100"
          darkBgColor="bg-green-900/40"
          hoverColor="bg-green-200"
          darkHoverColor="bg-green-800/60"
          compact={compact}
        />
        
        <AccessCard
          title="Clientes"
          icon={<Users size={iconSize} className={isDarkMode ? "text-blue-300" : "text-blue-700"} />}
          onClick={() => handleNavigation("clientes")}
          bgColor="bg-blue-100"
          darkBgColor="bg-blue-900/40"
          hoverColor="bg-blue-200"
          darkHoverColor="bg-blue-800/60"
          compact={compact}
        />
        
        <AccessCard
          title="Depósitos"
          icon={<PiggyBank size={iconSize} className={isDarkMode ? "text-purple-300" : "text-purple-700"} />}
          onClick={() => handleNavigation("depositos")}
          bgColor="bg-purple-100"
          darkBgColor="bg-purple-900/40"
          hoverColor="bg-purple-200"
          darkHoverColor="bg-purple-800/60"
          compact={compact}
        />
        
        <AccessCard
          title="Folgas"
          icon={<Calendar size={iconSize} className={isDarkMode ? "text-orange-300" : "text-orange-700"} />}
          onClick={() => handleNavigation("folgas")}
          bgColor="bg-orange-100"
          darkBgColor="bg-orange-900/40"
          hoverColor="bg-orange-200"
          darkHoverColor="bg-orange-800/60"
          compact={compact}
        />
        
        <AccessCard
          title="Diretório"
          icon={<FolderArchive size={iconSize} className={isDarkMode ? "text-cyan-300" : "text-cyan-700"} />}
          onClick={() => handleNavigation("diretorio")}
          bgColor="bg-cyan-100"
          darkBgColor="bg-cyan-900/40"
          hoverColor="bg-cyan-200"
          darkHoverColor="bg-cyan-800/60"
          compact={compact}
        />
      </div>
    </div>
  );
};
