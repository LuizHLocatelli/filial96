import { ReactNode } from "react";
import { EnhancedTopBar } from "./EnhancedTopBar";
import { NavigationTabs } from "./NavigationTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassAppLayoutProps {
  children: ReactNode;
}

export function GlassAppLayout({ children }: GlassAppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-animated-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-3000" />
      </div>

      {/* Glassmorphism Top Bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-30"
      >
        <EnhancedTopBar />
      </motion.div>
      
      {/* Main content with glassmorphism container */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className={cn(
          "flex-1 overflow-y-auto relative z-10",
          isMobile ? 'pb-36' : 'pb-32'
        )}
      >
        <div className="container mx-auto p-4">
          <div className="glass-card-medium rounded-2xl p-6 m-2 min-h-[calc(100vh-12rem)]">
            {children}
          </div>
        </div>
      </motion.main>
      
      {/* Glassmorphism Navigation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        className="relative z-30"
      >
        <NavigationTabs />
      </motion.div>

      {/* Ambient Light Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/3 via-transparent to-pink-500/3" />
      </div>
    </div>
  );
}
