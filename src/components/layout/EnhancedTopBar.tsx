import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "./CompanyLogo";
import { FolderLock } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function EnhancedTopBar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const isManager = profile?.role === 'gerente';

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
        "w-full flex items-center h-16 justify-between",
        isMobile ? "px-4" : "px-6 lg:px-8"
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


          

          {/* Action buttons com glassmorphism correto */}

          {isManager && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/diretorio-gerencial')}
                  className={cn(
                    "glass-button-default h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-white/30 dark:hover:border-white/20 cursor-pointer text-primary",
                    location.pathname === '/diretorio-gerencial' && "bg-primary/20 border-primary/50 text-primary"
                  )}
                >
                  <FolderLock className="h-5 w-5" />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Diretório Gerencial</p>
              </TooltipContent>
            </Tooltip>
          )}

          
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
