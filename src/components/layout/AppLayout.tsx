
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
      <div className="min-h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col max-w-full">
          <TopBar />
          <main className="flex-1 container mx-auto px-3 py-4 md:px-6 md:py-8 overflow-y-auto pb-20">
            {children}
          </main>
          <NavigationTabs />
        </div>
      </div>
    </SidebarProvider>
  );
}
