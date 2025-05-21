
import { Home, Bell, Settings, HelpCircle, Shield, User } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function NavigationTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  
  const tabs = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Venda O", icon: Bell, path: "/venda-o" },
    { type: "separator" } as const,
    { title: "Crediário", icon: Shield, path: "/crediario" },
    { title: "Cards", icon: User, path: "/cards-promocionais" },
    { title: "Perfil", icon: Settings, path: "/perfil" },
  ];
  
  // Set the selected tab based on current route when component mounts
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => 
      'path' in tab && tab.path === currentPath
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
    <div className="sticky top-16 z-30 w-full bg-background border-b pb-1">
      <div className="container mx-auto px-3 md:px-6">
        <ExpandableTabs 
          tabs={tabs as any} 
          onChange={handleTabChange}
          activeColor="text-primary" 
          className="border-primary/20 dark:border-primary/20" 
        />
      </div>
    </div>
  );
}
