import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  BarChart3,
  CheckSquare,
  FileText,
  List,
  Search,
  Filter,
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
    tarefas?: number;
  };
  onSearch: () => void;
  onFilters: () => void;
  hasActiveFilters: boolean;
}

interface NavItem {
  id: HubViewMode;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color: string;
}

export function MobileNavigation({
  currentSection,
  onSectionChange,
  badges,
  onSearch,
  onFilters,
  hasActiveFilters
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      badge: badges.dashboard,
      color: 'text-blue-600'
    },
    {
      id: 'rotinas',
      label: 'Rotinas',
      icon: CheckSquare,
      badge: badges.rotinas,
      color: 'text-green-600'
    },
    {
      id: 'orientacoes',
      label: 'Orientações',
      icon: FileText,
      badge: badges.orientacoes,
      color: 'text-purple-600'
    },
    {
      id: 'tarefas',
      label: 'Tarefas',
      icon: List,
      badge: badges.tarefas,
      color: 'text-orange-600'
    }
  ];

  const handleSectionChange = (section: HubViewMode) => {
    onSectionChange(section);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header Mobile */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        {/* Menu Hambúrguer */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header do Menu */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Hub de Produtividade</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Acesso rápido às suas ferramentas
                </p>
              </div>

              {/* Navegação Principal */}
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        currentSection === item.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className={cn("p-2 rounded-md", 
                        currentSection === item.id 
                          ? "bg-primary-foreground/20" 
                          : "bg-muted"
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
                          className="h-5 px-2 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                {/* Ações Rápidas */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Ações Rápidas
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSearch}
                      className="w-full justify-start gap-3"
                    >
                      <Search className="h-4 w-4" />
                      Buscar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onFilters}
                      className="w-full justify-start gap-3"
                    >
                      <Filter className="h-4 w-4" />
                      Filtros
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-auto h-4 w-4 p-0">
                          !
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer do Menu */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Título da Seção Atual */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">
            {navItems.find(item => item.id === currentSection)?.label || 'Hub'}
          </h1>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            className="p-2"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilters}
            className="p-2 relative"
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
            )}
            <span className="sr-only">Filtros</span>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2",
                "transition-colors duration-200 relative",
                currentSection === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
              {currentSection === item.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
} 