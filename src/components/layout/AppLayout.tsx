import { ReactNode } from "react";
import { EnhancedTopBar } from "./EnhancedTopBar";
import { NavigationTabs } from "./NavigationTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <EnhancedTopBar />
      
      {/* Main content com animação suave */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? 'pb-20' : 'pb-24 md:pb-8'
        )}
      >
        <div className={cn(
          "container mx-auto max-w-[1600px]",
          isMobile 
            ? 'px-2 py-3' 
            : 'px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6'
        )}>
          {children}
        </div>
      </motion.main>
      
      <NavigationTabs />
    </div>
  );
}
