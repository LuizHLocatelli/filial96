
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavBarDemo } from "@/components/ui/tubenabar-demo";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden relative">
        <AppSidebar />
        <div className="flex-1 flex flex-col max-w-full">
          <TopBar />
          <main className="flex-1 container mx-auto px-3 py-4 md:px-6 md:py-8 overflow-y-auto pb-24">
            {children}
          </main>
        </div>
        <div className="z-50">
          <NavBarDemo />
        </div>
      </div>
    </SidebarProvider>
  );
}

