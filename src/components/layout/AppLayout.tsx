
import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ensureBucketExists } from "@/utils/storage-helper";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isBucketChecked, setIsBucketChecked] = useState(false);
  
  // Verificação do bucket ao carregar o aplicativo
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const bucketExists = await ensureBucketExists("attachments");
        
        if (!bucketExists) {
          toast({
            variant: "destructive",
            title: "Erro de configuração",
            description: "O bucket de armazenamento 'attachments' não está disponível. Entre em contato com o suporte.",
          });
        }
        
        setIsBucketChecked(true);
      } catch (error) {
        console.error("Erro ao verificar bucket:", error);
      }
    };
    
    checkBucket();
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
      <Toaster />
    </SidebarProvider>
  );
}
