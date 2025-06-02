import { ReactNode } from "react";
import { EnhancedTopBar } from "./EnhancedTopBar";
import { NavigationTabs } from "./NavigationTabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <EnhancedTopBar />
      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20' : 'pb-24 md:pb-8'}`}>
        <div className={`container mx-auto max-w-[1600px] ${
          isMobile 
            ? 'px-2 py-3' 
            : 'px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6'
        }`}>
          {children}
        </div>
      </main>
      <NavigationTabs />
    </div>
  );
}
