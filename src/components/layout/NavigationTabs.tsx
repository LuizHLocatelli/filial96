
import { Home, Bell, Settings, Shield, User, Sofa } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function NavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  const tabs = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Móveis", icon: Sofa, path: "/moveis" },
    { type: "separator" } as const,
    { title: "Crediário", icon: Shield, path: "/crediario" },
    { title: "Cards", icon: User, path: "/cards-promocionais" },
    { title: "Perfil", icon: Settings, path: "/perfil" },
  ];
  
  // Set the selected tab based on current route when component mounts
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => 
      'path' in tab && (currentPath === tab.path || currentPath.startsWith(`${tab.path}/`))
    );
    
    if (tabIndex !== -1) {
      setSelectedTab(tabIndex);
    }
  }, [location.pathname]);
  
  const handleTabChange = (index: number | null) => {
    setSelectedTab(index);
    if (index !== null && 'path' in tabs[index]) {
      navigate(tabs[index].path);
    }
  };
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-md">
      <div className="bg-background/80 backdrop-blur-md border border-border/30 shadow-lg rounded-full px-1 py-1">
        <ExpandableTabs 
          tabs={tabs as any} 
          onChange={handleTabChange}
          activeColor="text-primary" 
          className="border-none shadow-none" 
          iconSize={isMobile ? 18 : 20}
        />
      </div>
    </div>
  );
}
