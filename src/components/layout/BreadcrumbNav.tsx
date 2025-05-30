
import { useLocation, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
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

export function BreadcrumbNav() {
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
      const label = breadcrumbMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    
    return breadcrumbs.length > 1 ? breadcrumbs : [];
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  if (breadcrumbs.length === 0) return null;
  
  return (
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
  );
}
