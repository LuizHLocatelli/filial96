import { ReactNode } from "react";
import { EnhancedTopBar } from "./EnhancedTopBar";
import { NavigationTabs } from "./NavigationTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AppLayout({ children, isChatOpen, setIsChatOpen }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background app-container status-bar-transition">
      <EnhancedTopBar isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
      
      {/* Main content com animação suave */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? 'pb-36' : 'pb-32'
        )}
      >
        {children}
      </motion.main>
      
      <NavigationTabs />
    </div>
  );
}
