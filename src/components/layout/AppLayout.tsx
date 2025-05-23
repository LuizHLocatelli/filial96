
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { NavigationTabs } from "./NavigationTabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-8 w-full">
            <div className="w-full max-w-full px-2 sm:px-3 md:px-6 py-3 sm:py-4 md:py-6">
              {children}
            </div>
          </main>
          <NavigationTabs />
        </div>
      </div>
    </SidebarProvider>
  );
}
