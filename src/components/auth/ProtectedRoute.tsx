
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { NAVIGATION_TABS } from "@/components/layout/navigation/constants";
import { Loader2 } from "@/components/ui/emoji-icons";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { hasAccessToTool, isLoading } = useRolePermissions();

  // Redirect to login page if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for permissions to load before deciding if permission is required
  if (requiredPermission && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check permission if required
  if (requiredPermission && !hasAccessToTool(requiredPermission)) {
    // Find the first tab they DO have access to
    const firstAllowedTab = NAVIGATION_TABS.find(tab => 
      !tab.permissionKey || hasAccessToTool(tab.permissionKey)
    );

    // If they have access to at least one tab, redirect there, otherwise redirect to a safe fallback like profile
    const fallbackPath = firstAllowedTab ? firstAllowedTab.path : "/perfil";
    
    // Prevent infinite redirect loops
    if (location.pathname !== fallbackPath) {
      return <Navigate to={fallbackPath} state={location.state} replace />;
    }
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
