import { useState, useEffect, useCallback, type ComponentType, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResponsive } from "@/hooks/use-responsive";
import { usePreloadOnHover } from "@/hooks/useLazyComponent";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { NAVIGATION_TABS, MOBILE_BREAKPOINT } from "./constants";

export function useNavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { preloadOnHover } = usePreloadOnHover();
  const { hasAccessToTool, isLoading: isPermissionsLoading } = useRolePermissions();
  
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [preloadedTabs, setPreloadedTabs] = useState<Set<string>>(new Set());

  const filteredTabs = useMemo(() => {
    if (isPermissionsLoading) return [];
    return NAVIGATION_TABS.filter(tab => !tab.permissionKey || hasAccessToTool(tab.permissionKey));
  }, [hasAccessToTool, isPermissionsLoading]);
  
  // Check for very small screen using window width
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Set selected tab based on current path
  useEffect(() => {
    if (filteredTabs.length === 0) return;
    
    const currentPath = location.pathname;
    const tabIndex = filteredTabs.findIndex(tab => 
      currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(`${tab.path}/`))
    );
    
    if (tabIndex !== -1) {
      setSelectedTab(tabIndex);
    } else if (currentPath === '/') {
      setSelectedTab(0);
    }
  }, [location.pathname, filteredTabs]);
  
  const handleTabChange = useCallback((index: number) => {
    const tab = filteredTabs[index];
    if (tab) {
      setSelectedTab(index);
      
      // Feedback háptico suave para mobile se disponível
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      navigate(tab.path);
    }
  }, [navigate, filteredTabs]);

  // Preload de componentes ao fazer hover/focus
  const getTabPreloadProps = useCallback((path: string) => {
    if (preloadedTabs.has(path)) return {};

    const preloadMap: Record<string, () => Promise<{ default: ComponentType<unknown> }>> = {
      '/crediario': () => import('@/pages/Crediario') as Promise<{ default: ComponentType<unknown> }>,
      '/moveis': () => import('@/pages/Moveis') as Promise<{ default: ComponentType<unknown> }>,
      '/moda': () => import('@/pages/Moda') as Promise<{ default: ComponentType<unknown> }>,
      '/cards-promocionais': () => import('@/pages/PromotionalCards') as Promise<{ default: ComponentType<unknown> }>,
      '/': () => import('@/pages/HubProdutividade') as Promise<{ default: ComponentType<unknown> }>,
    };

    const importFunction = preloadMap[path];
    if (!importFunction) return {};

    return preloadOnHover(() => {
      setPreloadedTabs(prev => new Set([...prev, path]));
      return importFunction();
    }, `page-${path}`);
  }, [preloadedTabs, preloadOnHover]);

  return {
    selectedTab,
    isSmallScreen,
    isMobile,
    tabs: filteredTabs,
    handleTabChange,
    getTabPreloadProps
  };
}
