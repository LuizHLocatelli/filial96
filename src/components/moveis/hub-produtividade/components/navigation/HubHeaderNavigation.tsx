
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
      description: 'Visão geral da produtividade'
    },
    {
      id: 'rotinas',
      label: 'Rotinas',
      shortLabel: 'Rotinas',
      icon: CheckSquare,
      badge: badges.rotinas,
      description: 'Rotinas obrigatórias'
    },
    {
      id: 'orientacoes',
      label: 'Informativos e VM',
      shortLabel: 'Informativos',
      icon: FileText,
      badge: badges.orientacoes,
      description: 'Documentos e orientações'
    },
    {
      id: 'monitoramento',
      label: 'Monitoramento',
      shortLabel: 'Monitor',
      icon: Users,
      badge: badges.monitoramento,
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

      {/* Navegação em Grid - Estilo Móveis/Crediário */}
      <div className="px-4 py-4">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 max-w-4xl mx-auto">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <motion.div
                key={item.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group",
                  isMobile ? 'h-24' : 'h-28',
                  isActive 
                    ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg scale-105" 
                    : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSectionChange(item.id)}
              >
                {/* Background Pattern - apenas para item ativo */}
                {isActive && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full" />
                    <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full" />
                  </div>
                )}
                
                {/* Conteúdo do Card */}
                <div className="relative h-full flex flex-col items-center justify-center p-3">
                  {/* Ícone */}
                  <div className={cn(
                    "p-2 rounded-xl mb-2 relative transition-colors duration-300",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-background/50 group-hover:bg-background/80"
                  )}>
                    <Icon 
                      size={iconSize} 
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-white" : "text-primary"
                      )}
                    />
                    
                    {/* Badge de notificação */}
                    {item.badge && item.badge > 0 && (
                      <Badge 
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "font-semibold text-center leading-tight transition-colors duration-300",
                    isMobile ? 'text-xs' : 'text-sm',
                    isActive ? "text-white" : "text-foreground group-hover:text-foreground"
                  )}>
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">{item.shortLabel}</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
