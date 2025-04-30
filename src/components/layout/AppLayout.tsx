
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
  const [isBucketAvailable, setIsBucketAvailable] = useState(false);
  
  // Verificação do bucket ao carregar o aplicativo
  useEffect(() => {
    const checkBucket = async () => {
      try {
        console.log("Iniciando verificação do bucket 'attachments'...");
        const bucketExists = await ensureBucketExists("attachments");
        console.log("Resultado da verificação:", bucketExists);
        
        setIsBucketAvailable(bucketExists);
        
        if (!bucketExists) {
          toast({
            variant: "destructive",
            title: "Erro de configuração",
            description: "O bucket de armazenamento 'attachments' não está disponível. É necessário criá-lo manualmente no console do Supabase.",
          });
        } else {
          toast({
            title: "Armazenamento disponível",
            description: "O bucket 'attachments' está configurado corretamente.",
          });
        }
        
        setIsBucketChecked(true);
      } catch (error) {
        console.error("Erro ao verificar bucket:", error);
        setIsBucketChecked(true);
        setIsBucketAvailable(false);
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
            {!isBucketChecked && (
              <div className="fixed bottom-4 right-4 bg-amber-50 p-3 rounded-md border border-amber-200 shadow-md max-w-md">
                <p className="text-amber-800 font-medium">Verificando acesso ao armazenamento...</p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
