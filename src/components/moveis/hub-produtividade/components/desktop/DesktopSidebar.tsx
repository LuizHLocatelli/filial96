
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  BarChart3,
  CheckSquare,
  FileText,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Settings,
  Bell,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HubViewMode } from '../../types';

interface DesktopSidebarProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  badges: {
    dashboard?: number;
    rotinas?: number;
    orientacoes?: number;
    monitoramento?: number;
  };
  stats: any;
  onSearch: () => void;
  onFilters: () => void;
  onRefresh: () => void;
  onNewItem: (type: 'rotina' | 'orientacao' | 'tarefa') => void;
  hasActiveFilters: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: HubViewMode;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color: string;
  description: string;
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface MetricItem {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

export function DesktopSidebar({
  currentSection,
  onSectionChange,
  badges,
  stats,
  onSearch,
  onFilters,
  onRefresh,
  onNewItem,
  hasActiveFilters,
  isCollapsed = false,
  onToggleCollapse
}: DesktopSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Hub de Produtividade',
      icon: BarChart3,
      badge: badges.dashboard,
      color: 'text-blue-600',
      description: 'Visão geral completa'
    },
    {
      id: 'rotinas',
      label: 'Rotinas',
      icon: CheckSquare,
      badge: badges.rotinas,
      color: 'text-green-600',
      description: 'Rotinas obrigatórias'
    },
    {
      id: 'orientacoes',
      label: 'Informativos e VM',
      icon: FileText,
      badge: badges.orientacoes,
      color: 'text-purple-600',
      description: 'Documentos e guias'
    },
    {
      id: 'monitoramento',
      label: 'Monitoramento',
      icon: Users,
      badge: badges.dashboard, // Usando badge do dashboard como placeholder
      color: 'text-cyan-600',
      description: 'Análises e relatórios'
    }
  ];

  const quickActions: QuickActionItem[] = [
    {
      id: 'search',
      label: 'Buscar',
      icon: Search,
      action: onSearch,
      variant: 'ghost'
    },
    {
      id: 'filters',
      label: 'Filtros',
      icon: Filter,
      action: onFilters,
      variant: 'ghost'
    },
    {
      id: 'refresh',
      label: 'Atualizar',
      icon: RefreshCw,
      action: onRefresh,
      variant: 'ghost'
    },
    {
      id: 'new-rotina',
      label: 'Nova Rotina',
      icon: Plus,
      action: () => onNewItem('rotina'),
      variant: 'default'
    }
  ];

  const metrics: MetricItem[] = [
    {
      label: 'Total',
      value: (stats.rotinas?.total || 0) + (stats.orientacoes?.total || 0),
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Concluídas',
      value: `${stats.rotinas?.percentualConclusao || 0}%`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Pendentes',
      value: (stats.rotinas?.pendentes || 0),
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      label: 'Atrasadas',
      value: (stats.rotinas?.atrasadas || 0),
      icon: Calendar,
      color: 'text-red-600'
    }
  ];

  const handleNavigation = (sectionId: HubViewMode) => {
    onSectionChange(sectionId);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-background border-r flex flex-col">
        {/* Toggle Button */}
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsed Navigation */}
        <div className="flex-1 p-2 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentSection === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item.id)}
              className="w-full p-2 relative"
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Quick Actions Collapsed */}
        <div className="p-2 border-t space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            className="w-full p-2"
            title="Buscar"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilters}
            className="w-full p-2 relative"
            title="Filtros"
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-background border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">Hub Produtividade</h2>
              <p className="text-xs text-muted-foreground mt-1">Filial 96</p>
            </div>
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm rounded-xl border-muted"
            onFocus={onSearch}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Navegação
            </h3>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group",
                    currentSection === item.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <div className={cn("p-2 rounded-lg transition-colors", 
                    currentSection === item.id 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-muted"
                  )}>
                    <item.icon className={cn("h-4 w-4",
                      currentSection === item.id ? "text-primary-foreground" : item.color
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge 
                          variant={currentSection === item.id ? "secondary" : "destructive"}
                          className="ml-2 h-5 px-2 text-xs font-semibold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-70 truncate">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={action.action}
                  className={cn(
                    "h-16 flex-col gap-1.5 rounded-xl relative",
                    action.variant === 'default' && "col-span-2"
                  )}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{action.label}</span>
                  {action.id === 'filters' && hasActiveFilters && (
                    <div className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Metrics */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Resumo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border bg-gradient-to-br from-background to-muted/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className={cn("h-3.5 w-3.5", metric.color)} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <div className="text-lg font-bold">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" className="h-12 flex-col gap-1 rounded-xl">
            <Bell className="h-4 w-4" />
            <span className="text-xs">Notificações</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-12 flex-col gap-1 rounded-xl">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Configurações</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 
