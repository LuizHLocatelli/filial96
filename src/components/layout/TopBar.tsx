
import { Link } from "react-router-dom";
import { Home, ChevronRight, Search, Menu, X, Building2 } from "lucide-react";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/moveis': 'Móveis',
  '/crediario': 'Crediário',
  '/cards-promocionais': 'Cards Promocionais',
  '/perfil': 'Perfil'
};

const navigationItems = [
  { title: "Dashboard", href: "/", icon: Home, description: "Visão geral do sistema" },
  { title: "Móveis", href: "/moveis", icon: Building2, description: "Gestão do setor de móveis" },
  { title: "Crediário", href: "/crediario", icon: Building2, description: "Gestão de crediário" },
  { title: "Cards Promocionais", href: "/cards-promocionais", icon: Building2, description: "Materiais promocionais" },
  { title: "Perfil", href: "/perfil", icon: Building2, description: "Configurações da conta" }
];

export function TopBar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{
      label: 'Dashboard',
      path: '/'
    }];
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = breadcrumbMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    return breadcrumbs.length > 1 ? breadcrumbs : [];
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Company Logo and Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-sm group-hover:blur-none transition-all duration-300" />
              <div className="relative bg-gradient-to-r from-primary to-primary/80 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Filial 96
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block leading-none">
                Sistema de Gestão
              </span>
            </div>
          </Link>

          {/* Desktop Breadcrumbs */}
          {!isMobile && breadcrumbs.length > 0 && (
            <nav className="ml-6">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center">
                      {index === 0 && <Home className="h-4 w-4 mr-2" />}
                      {index > 0 && <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="font-medium">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.path} className="hover:text-foreground transition-colors">
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </nav>
          )}
        </div>

        {/* Center Section - Search (Desktop) */}
        {!isMobile && !isSearchOpen && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 pr-4 w-full bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-10 w-10"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <ThemeToggle />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobile && isSearchOpen && (
        <div className="border-t bg-background/95 backdrop-blur-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10 pr-4 w-full"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="border-t bg-background/95 backdrop-blur-lg">
          <div className="container py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                      isActive ? "bg-primary/10 text-primary border border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
