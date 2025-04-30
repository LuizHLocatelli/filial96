
import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { checkBucketAvailability } from "@/integrations/supabase/client";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isBucketChecked, setIsBucketChecked] = useState(false);
  const [isBucketAvailable, setIsBucketAvailable] = useState(false);
  const [bucketMessage, setBucketMessage] = useState("");
  
  // Verificação do bucket ao carregar o aplicativo
  const verifyBucketStatus = async () => {
    try {
      console.log("Iniciando verificação do bucket 'attachments'...");
      const status = await checkBucketAvailability();
      
      setIsBucketChecked(status.checked);
      setIsBucketAvailable(status.available);
      setBucketMessage(status.message);
      
      if (!status.available) {
        toast({
          variant: "destructive",
          title: "Configuração necessária",
          description: status.message,
        });
      } else {
        toast({
          title: "Armazenamento disponível",
          description: "O sistema de armazenamento está configurado corretamente",
        });
      }
    } catch (error: any) {
      console.error("Erro ao verificar status do bucket:", error);
      setIsBucketChecked(true);
      setIsBucketAvailable(false);
      setBucketMessage("Ocorreu um erro ao verificar o armazenamento.");
      
      toast({
        variant: "destructive",
        title: "Erro de configuração",
        description: error.message || "Ocorreu um erro ao verificar o armazenamento.",
      });
    }
  };
  
  useEffect(() => {
    verifyBucketStatus();
  }, []);
  
  const handleRetryBucketCheck = () => {
    setIsBucketChecked(false);
    setBucketMessage("Verificando novamente o acesso ao armazenamento...");
    verifyBucketStatus();
  };
  
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
            
            {isBucketChecked && !isBucketAvailable && (
              <div className="fixed bottom-4 right-4 bg-red-50 p-4 rounded-md border border-red-200 shadow-md max-w-md">
                <p className="text-red-800 font-medium">Problema de armazenamento</p>
                <p className="text-red-700 mb-2">{bucketMessage}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryBucketCheck} 
                  className="flex items-center gap-1"
                >
                  <RotateCw className="h-3 w-3" />
                  Verificar novamente
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
