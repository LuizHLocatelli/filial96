
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { 
  Menu,
  X,
  Search,
  Filter,
  BarChart3,
  CheckSquare,
  FileText,
  Users,
  Activity,
  Bell,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HubViewMode } from '../../types';

interface MobileNavigationProps {
  currentSection: HubViewMode;
  onSectionChange: (section: HubViewMode) => void;
  badges: {
    dashboard?: number;
    rotinas?: number;
    orientacoes?: number;
    monitoramento?: number;
  };
  hasActiveFilters: boolean;
}

interface NavItem {
  id: HubViewMode;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: number;
  color: string;
}

export function MobileNavigation({
  currentSection,
  onSectionChange,
  badges,
  hasActiveFilters
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Hub de Produtividade',
      shortLabel: 'Hub',
      icon: BarChart3,
      badge: badges.dashboard,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'rotinas',
      label: 'Rotinas',
      shortLabel: 'Rotinas',
      icon: CheckSquare,
      badge: badges.rotinas,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'orientacoes',
      label: 'Informativos e VM',
      shortLabel: 'Informativos',
      icon: FileText,
      badge: badges.orientacoes,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'monitoramento',
      label: 'Monitoramento',
      shortLabel: 'Monitor',
      icon: Users,
      badge: badges.monitoramento,
      color: 'text-cyan-600 dark:text-cyan-400'
    }
  ];

  const getCurrentSectionLabel = () => {
    const current = allNavItems.find(item => item.id === currentSection);
    return current ? current.label : 'Hub de Produtividade';
  };

  return (
    <>
      {/* Header Mobile */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">Menu de Navegação do Hub de Produtividade</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Header do Menu */}
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg leading-none">Hub de Produtividade</h2>
                          <p className="text-xs text-muted-foreground mt-1">Filial 96</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMenuOpen(false)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Navegação Principal */}
                  <div className="flex-1 p-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        Seções
                      </h3>
                      {allNavItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSectionChange(item.id);
                            setIsMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                            currentSection === item.id
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", 
                            currentSection === item.id 
                              ? "bg-primary-foreground/20" 
                              : "bg-muted/50"
                          )}>
                            <item.icon className={cn("h-4 w-4",
                              currentSection === item.id ? "text-primary-foreground" : item.color
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <Badge 
                              variant={currentSection === item.id ? "secondary" : "destructive"}
                              className="h-5 px-2 text-xs font-semibold"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Ações Rápidas */}
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        Ações Rápidas
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Removido: botões de busca e filtro */}
                      </div>
                    </div>
                  </div>

                  {/* Footer do Menu */}
                  <div className="p-4 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="ghost" size="sm" className="h-12 flex-col gap-1 rounded-xl">
                        <Bell className="h-4 w-4" />
                        <span className="text-xs">Notificações</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-12 flex-col gap-1 rounded-xl">
                        <Settings className="h-4 w-4" />
                        <span className="text-xs">Config</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-base leading-none">{getCurrentSectionLabel()}</h1>
                <p className="text-xs text-muted-foreground">Filial 96</p>
              </div>
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-1">
            {/* Removido: botões de busca e filtro */}
          </div>
        </div>
      </div>
    </>
  );
} 
