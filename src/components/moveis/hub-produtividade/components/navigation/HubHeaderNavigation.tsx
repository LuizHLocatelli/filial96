
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Activity,
  BarChart3,
  CheckSquare,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { HubViewMode } from '../../types';

interface HubHeaderNavigationProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  badges: {
    dashboard?: number;
    rotinas?: number;
    orientacoes?: number;
    monitoramento?: number;
  };
}

interface NavItem {
  id: HubViewMode;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: number;
  bgColor: string;
  darkBgColor: string;
  hoverColor: string;
  darkHoverColor: string;
  iconColor: string;
  description: string;
}

export function HubHeaderNavigation({
  currentSection,
  onSectionChange,
  badges
}: HubHeaderNavigationProps) {
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Hub de Produtividade',
      shortLabel: 'Hub',
      icon: BarChart3,
      badge: badges.dashboard,
      bgColor: 'bg-green-100',
      darkBgColor: 'bg-green-900/40',
      hoverColor: 'bg-green-200',
      darkHoverColor: 'bg-green-800/60',
      iconColor: isDarkMode ? 'text-green-300' : 'text-green-700',
      description: 'Visão geral da produtividade'
    },
    {
      id: 'rotinas',
      label: 'Rotinas',
      shortLabel: 'Rotinas',
      icon: CheckSquare,
      badge: badges.rotinas,
      bgColor: 'bg-green-100',
      darkBgColor: 'bg-green-900/40',
      hoverColor: 'bg-green-200',
      darkHoverColor: 'bg-green-800/60',
      iconColor: isDarkMode ? 'text-green-300' : 'text-green-700',
      description: 'Rotinas obrigatórias'
    },
    {
      id: 'orientacoes',
      label: 'Informativos e VM',
      shortLabel: 'Informativos',
      icon: FileText,
      badge: badges.orientacoes,
      bgColor: 'bg-green-100',
      darkBgColor: 'bg-green-900/40',
      hoverColor: 'bg-green-200',
      darkHoverColor: 'bg-green-800/60',
      iconColor: isDarkMode ? 'text-green-300' : 'text-green-700',
      description: 'Documentos e orientações'
    },
    {
      id: 'monitoramento',
      label: 'Monitoramento',
      shortLabel: 'Monitor',
      icon: Users,
      badge: badges.monitoramento,
      bgColor: 'bg-green-100',
      darkBgColor: 'bg-green-900/40',
      hoverColor: 'bg-green-200',
      darkHoverColor: 'bg-green-800/60',
      iconColor: isDarkMode ? 'text-green-300' : 'text-green-700',
      description: 'Monitoramento de visualizações'
    }
  ];

  const iconSize = isMobile ? 20 : 24;

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b sticky top-0 z-40">
      {/* Header Superior com Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Hub de Produtividade</h1>
            <p className="text-xs text-muted-foreground mt-1">Filial 96</p>
          </div>
        </div>
      </div>

      {/* Navegação em Grid - 4 por linha */}
      <div className="px-4 py-3">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 max-w-4xl mx-auto">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <motion.div
                key={item.id}
                className={cn(
                  isDarkMode ? item.darkBgColor : item.bgColor,
                  "rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                  isMobile ? 'p-3 h-20' : 'p-2 h-20',
                  isActive && "ring-2 ring-primary scale-105"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSectionChange(item.id)}
              >
                {/* Ícone com fundo */}
                <div className={cn(
                  isDarkMode ? item.darkHoverColor : item.hoverColor,
                  isMobile ? 'p-2 mb-2' : 'p-1.5 mb-1',
                  "rounded-full relative"
                )}>
                  <Icon 
                    size={iconSize} 
                    className={item.iconColor}
                  />
                  
                  {/* Badge de notificação */}
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "font-medium text-center",
                  isMobile ? 'text-sm' : 'text-xs',
                  isDarkMode ? 'text-white' : 'text-gray-800'
                )}>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
