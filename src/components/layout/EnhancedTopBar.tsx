
import { Link } from "react-router-dom";
import { Home, ChevronRight, Search, X } from "lucide-react";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "./CompanyLogo";
import { SearchBar } from "./SearchBar";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
import { GlobalSearchResults } from "./GlobalSearchResults";
import { useOnClickOutside } from "usehooks-ts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function EnhancedTopBar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchTerm, performSearch, clearSearch } = useGlobalSearch();
  
  // Refs para controle de click outside
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Fechar pesquisa mobile ao clicar fora
  useOnClickOutside(mobileSearchRef, () => {
    if (isMobile && isSearchOpen) {
      setIsSearchOpen(false);
      clearSearch();
    }
  });

  // Fechar modais ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMobile && isSearchOpen) {
          setIsSearchOpen(false);
          clearSearch();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isSearchOpen, clearSearch]);

  const handleMobileSearchClose = () => {
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleMobileSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleMobileSearchClose();
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg"
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

        {/* Center Section - Search (Desktop only) */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="hidden md:flex flex-1 justify-center px-4"
          >
            <SearchBar 
              isMobile={isMobile}
              isSearchOpen={isSearchOpen}
              onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          </motion.div>
        )}

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
          {/* Mobile Search Toggle */}
          {isMobile && (
            <SearchBar 
              isMobile={isMobile}
              isSearchOpen={isSearchOpen}
              onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          )}

          {/* Action buttons com glassmorphism correto */}
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
            <NotificationsMenu />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="glass-button-default h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-white/30 dark:hover:border-white/20"
          >
            <UserMenu />
          </motion.div>
        </div>
      </div>

      {/* Mobile Search Expandable com design melhorado */}
      <AnimatePresence>
        {isMobile && isSearchOpen && (
          <motion.div 
            ref={mobileSearchRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t bg-background/98 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <div className="p-4">
              {/* Header da busca */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Busca</h3>
                  <p className="text-xs text-muted-foreground">Encontre páginas e seções</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMobileSearchClose}
                  className="h-8 w-8 rounded-full hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Campo de busca melhorado */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar páginas, seções..."
                    className="pl-10 pr-4 w-full rounded-xl border-2 focus:border-primary/50 bg-background"
                    value={searchTerm}
                    onChange={(e) => performSearch(e.target.value)}
                    onKeyDown={handleMobileSearchKeyDown}
                    autoFocus
                  />
                </motion.div>
              </div>
              
              {/* Resultados da pesquisa mobile com estilo específico */}
              <div className="mt-4">
                <GlobalSearchResults onResultClick={handleMobileSearchClose} isMobile={true} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
