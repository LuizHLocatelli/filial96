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
  List,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Settings,
  Bell,
  User,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Archive,
  Bookmark,
  Star,
  ChevronRight,
  ChevronDown,
  Home,
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
    tarefas?: number;
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
  shortcut?: string;
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

interface MetricItem {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'stable';
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['navigation', 'actions']);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      badge: badges.dashboard,
      color: 'text-blue-600',
      description: 'Visão geral completa',
      shortcut: '⌘D'
    },
    {
      id: 'rotinas',
      label: 'Rotinas',
      icon: CheckSquare,
      badge: badges.rotinas,
      color: 'text-green-600',
      description: 'Rotinas obrigatórias',
      shortcut: '⌘R'
    },
    {
      id: 'orientacoes',
      label: 'Orientações',
      icon: FileText,
      badge: badges.orientacoes,
      color: 'text-purple-600',
      description: 'Documentos e guias',
      shortcut: '⌘O'
    },
    {
      id: 'tarefas',
      label: 'Tarefas',
      icon: List,
      badge: badges.tarefas,
      color: 'text-orange-600',
      description: 'Gestão de tarefas',
      shortcut: '⌘T'
    }
  ];

  const quickActions: QuickActionItem[] = [
    {
      id: 'search',
      label: 'Buscar',
      icon: Search,
      action: onSearch,
      shortcut: '⌘K',
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
      shortcut: '⌘⇧R',
      variant: 'ghost'
    },
    {
      id: 'new-rotina',
      label: 'Nova Rotina',
      icon: Plus,
      action: () => onNewItem('rotina'),
      shortcut: '⌘N',
      variant: 'default'
    }
  ];

  const metrics: MetricItem[] = [
    {
      label: 'Total Itens',
      value: (stats.rotinas?.total || 0) + (stats.orientacoes?.total || 0) + (stats.tarefas?.total || 0),
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Concluídas',
      value: `${stats.rotinas?.percentualConclusao || 0}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      trend: 'up'
    },
    {
      label: 'Pendentes',
      value: (stats.rotinas?.pendentes || 0) + (stats.tarefas?.pendentes || 0),
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      label: 'Atrasadas',
      value: (stats.rotinas?.atrasadas || 0) + (stats.tarefas?.atrasadas || 0),
      icon: Calendar,
      color: 'text-red-600'
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

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
            title="Buscar (⌘K)"
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
    <div className="w-80 h-full bg-background border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Hub Produtividade</h2>
              <p className="text-xs text-muted-foreground">Painel de controle</p>
            </div>
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tudo (⌘K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
            onFocus={onSearch}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Navigation */}
          <div>
            <button
              onClick={() => toggleSection('navigation')}
              className="flex items-center justify-between w-full mb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>NAVEGAÇÃO</span>
              {expandedSections.includes('navigation') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.includes('navigation') && (
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground group",
                      currentSection === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-md", 
                      currentSection === item.id 
                        ? "bg-primary-foreground/20" 
                        : "bg-muted group-hover:bg-accent-foreground/10"
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
                            className="ml-2 h-5 px-2 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-70 truncate">{item.description}</p>
                    </div>
                    {item.shortcut && (
                      <span className="text-xs opacity-50">{item.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <button
              onClick={() => toggleSection('actions')}
              className="flex items-center justify-between w-full mb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>AÇÕES RÁPIDAS</span>
              {expandedSections.includes('actions') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.includes('actions') && (
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    size="sm"
                    onClick={action.action}
                    className="w-full justify-start gap-3 relative"
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{action.label}</span>
                    {action.id === 'filters' && hasActiveFilters && (
                      <div className="h-2 w-2 bg-destructive rounded-full" />
                    )}
                    {action.shortcut && (
                      <span className="text-xs opacity-60">{action.shortcut}</span>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Metrics */}
          <div>
            <button
              onClick={() => toggleSection('metrics')}
              className="flex items-center justify-between w-full mb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <span>MÉTRICAS</span>
              {expandedSections.includes('metrics') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.includes('metrics') && (
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <metric.icon className={cn("h-3 w-3", metric.color)} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {metric.label}
                      </span>
                    </div>
                    <div className="text-lg font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Recent/Favorites */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">RECENTES</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Rotina de Abertura</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                <Bookmark className="h-4 w-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Manual Vendas</p>
                  <p className="text-xs text-muted-foreground">Ontem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
        </div>
      </div>
    </div>
  );
} 