import { cn } from "@/lib/utils";
import { TabContainer } from "./navigation/TabContainer";
import { TabButton } from "./navigation/TabButton";
import { DesktopIndicator } from "./navigation/DesktopIndicator";
import { useNavigationTabs } from "./navigation/useNavigationTabs";

export function NavigationTabs() {
  const {
    selectedTab,
    isSmallScreen,
    isMobile,
    tabs,
    handleTabChange
  } = useNavigationTabs();
  
  return (
    <TabContainer isMobile={isMobile} isSmallScreen={isSmallScreen}>
      {/* Container da navegação */}
      <div className={cn(
        "relative flex items-center",
        isMobile 
          ? cn(
              "justify-between",
              isSmallScreen ? "gap-0.5 px-1" : "gap-1 px-2"
            )
          : "justify-center gap-4"
      )}>
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.path}
            tab={tab}
            index={index}
            isActive={selectedTab === index}
            isSmallScreen={isSmallScreen}
            isMobile={isMobile}
            onTabClick={handleTabChange}
          />
        ))}
      </div>
      
      {/* Indicador inferior para desktop 
      {!isMobile && selectedTab !== null && (
        <DesktopIndicator 
          selectedTab={selectedTab} 
          tabsLength={tabs.length} 
        />
      )}
      */}
    </TabContainer>
  );
}
