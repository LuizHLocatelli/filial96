
import { useState, useEffect, type ComponentType } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePreloadOnHover } from "@/hooks/useLazyComponent";
import { NAVIGATION_TABS } from "./constants";

export function useNavigationTabsOptimized() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 430;
  const { preloadOnHover } = usePreloadOnHover();

  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [preloadedTabs, setPreloadedTabs] = useState<Set<string>>(new Set());

  // Determinar aba ativa baseada na rota atual
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = NAVIGATION_TABS.findIndex(tab => 
      currentPath === tab.path || 
      (tab.path !== '/' && currentPath.startsWith(tab.path))
    );
    setSelectedTab(activeIndex >= 0 ? activeIndex : 0);
  }, [location.pathname]);

  const handleTabChange = (index: number) => {
    const tab = NAVIGATION_TABS[index];
    if (tab) {
      setSelectedTab(index);
      navigate(tab.path);
    }
  };

  // Preload de componentes ao fazer hover
  const getTabPreloadProps = (path: string) => {
    if (preloadedTabs.has(path)) return {};

    const preloadMap: Record<string, () => Promise<{ default: ComponentType<unknown> }>> = {
      '/crediario': () => import('../../../pages/Crediario') as Promise<{ default: ComponentType<unknown> }>,
      '/moveis': () => import('../../../pages/Moveis') as Promise<{ default: ComponentType<unknown> }>,
      '/moda': () => import('../../../pages/Moda') as Promise<{ default: ComponentType<unknown> }>,
      '/cards-promocionais': () => import('../../../pages/PromotionalCards') as Promise<{ default: ComponentType<unknown> }>,
    };

    const importFunction = preloadMap[path];
    if (!importFunction) return {};

    return preloadOnHover(() => {
      setPreloadedTabs(prev => new Set([...prev, path]));
      return importFunction();
    });
  };

  return {
    selectedTab,
    isSmallScreen,
    isMobile,
    tabs: NAVIGATION_TABS,
    handleTabChange,
    getTabPreloadProps
  };
}
