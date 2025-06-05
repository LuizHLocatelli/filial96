
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { NAVIGATION_TABS, MOBILE_BREAKPOINT } from "./constants";

export function useNavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const isMobile = useIsMobile();
  
  // Check for very small screen
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
    const currentPath = location.pathname;
    const tabIndex = NAVIGATION_TABS.findIndex(tab => 
      currentPath === tab.path || currentPath.startsWith(`${tab.path}/`)
    );
    
    if (tabIndex !== -1) {
      setSelectedTab(tabIndex);
    }
  }, [location.pathname]);
  
  const handleTabChange = (index: number | null) => {
    setSelectedTab(index);
    if (index !== null) {
      navigate(NAVIGATION_TABS[index].path);
    }
  };

  return {
    selectedTab,
    isSmallScreen,
    isMobile,
    tabs: NAVIGATION_TABS,
    handleTabChange
  };
}
