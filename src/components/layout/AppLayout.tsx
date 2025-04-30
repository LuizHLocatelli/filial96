
import { ReactNode, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ensureBucketExists } from "@/utils/storage-helper";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  // Ensure storage bucket exists on app load
  useEffect(() => {
    ensureBucketExists("attachments").then(exists => {
      if (!exists) {
        console.error("Failed to ensure attachments bucket exists");
      }
    });
  }, []);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col max-w-full">
          <TopBar />
          <main className="flex-1 container mx-auto px-3 py-4 md:px-6 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
