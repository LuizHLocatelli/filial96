
import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { setupStorage } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  
  // Ensure storage bucket exists on app load
  useEffect(() => {
    async function initializeStorage() {
      const result = await setupStorage();
      setStorageReady(result);
      
      if (!result) {
        toast({
          title: "Atenção",
          description: "Não foi possível inicializar o armazenamento. Algumas funcionalidades podem não funcionar corretamente.",
          variant: "destructive"
        });
      }
    }
    
    initializeStorage();
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
