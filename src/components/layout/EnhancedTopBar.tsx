import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatBotButton } from "@/components/chatbot";
import { ForceUpdateButton } from "@/components/pwa/ForceUpdateButton";
import { CompanyLogo } from "./CompanyLogo";

interface EnhancedTopBarProps {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EnhancedTopBar({ isChatOpen, setIsChatOpen }: EnhancedTopBarProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "glass-topbar sticky top-0 z-50 h-16",
        "bg-background/80 dark:bg-background/70 backdrop-blur-lg",
        "border-b border-border/40 dark:border-border/20",
        "shadow-sm dark:shadow-lg shadow-black/5 dark:shadow-black/20",
        location.pathname === "/" ? "transition-all duration-300" : ""
      )}
    >
      <div className={cn(
        "container flex items-center h-16",
        isMobile ? "px-3 justify-between" : "px-6"
      )}>
        {/* Left Section - Logo and Navigation */}
        <div className={cn(
          "flex items-center space-x-3",
          isMobile ? "flex-1 min-w-0" : "flex-shrink-0"
        )}>
          {/* Company Logo and Name com espaçamento otimizado */}
          <div className="min-w-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyLogo />
            </motion.div>
          </div>
        </div>


        {/* Right Section - Actions com melhor espaçamento e glassmorphism corrigido */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={cn(
            "flex items-center space-x-1 flex-shrink-0",
            !isMobile && "ml-4"
          )}
        >
          {/* Install PWA Button - só mostra quando pode instalar */}
          {!isMobile && (
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <InstallPWAButton />
            </motion.div>
          )}

          {/* Chat Button */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="glass-button-default h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-white/30 dark:hover:border-white/20"
          >
            <ChatBotButton 
              isOpen={isChatOpen}
              onClick={() => setIsChatOpen(!isChatOpen)}
            />
          </motion.div>

          {/* Action buttons com glassmorphism correto */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="glass-button-default h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-white/30 dark:hover:border-white/20"
          >
            <ForceUpdateButton />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="glass-button-default h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-white/30 dark:hover:border-white/20"
          >
            <ThemeToggle />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="glass-button-default h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-white/30 dark:hover:border-white/20"
          >
            <UserMenu />
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}
