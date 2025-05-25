import { Link } from "react-router-dom";
import { Menu, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/moveis': 'Móveis',
  '/crediario': 'Crediário',
  '/cards-promocionais': 'Cards Promocionais',
  '/perfil': 'Perfil'
};
export function TopBar() {
  const sidebar = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{
      label: 'Dashboard',
      path: '/'
    }];
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = breadcrumbMap[currentPath] || segment;
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    return breadcrumbs.length > 1 ? breadcrumbs : [];
  };
  const breadcrumbs = getBreadcrumbs();
  return <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-soft">
      <div className={`container flex items-center justify-between ${isMobile ? 'h-12 px-2' : 'h-14 px-3 md:px-6'}`}>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className={`${isMobile ? 'mr-2 h-9 w-9' : 'mr-4'} md:hidden hover:bg-accent`} onClick={() => sidebar.toggleSidebar()}>
            <Menu className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex flex-col">
              <span className={`font-bold gradient-text ${isMobile ? 'text-base' : 'text-lg'}`}>Filial 96</span>
              {!isMobile && <span className="text-xs text-muted-foreground hidden sm:block">
                  Sistema de Gestão
                </span>}
            </div>
          </Link>

          {/* Breadcrumbs */}
          {!isMobile && breadcrumbs.length > 0 && <nav className="flex items-center ml-6 space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => <div key={crumb.path} className="flex items-center space-x-2">
                  {index === 0 && <Home className="h-4 w-4" />}
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <Link to={crumb.path} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                </div>)}
            </nav>}
        </div>
        
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1 sm:gap-2'}`}>
          <ThemeToggle />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>
    </header>;
}