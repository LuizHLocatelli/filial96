import { Link } from "react-router-dom";
import { Home, ChevronRight, Search, Menu, X } from "lucide-react";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileNavMenu } from "./MobileNavMenu";
import { BreadcrumbNav } from "./BreadcrumbNav";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchTerm, performSearch, clearSearch } = useGlobalSearch();
  
  // Refs para controle de click outside
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fechar pesquisa mobile ao clicar fora
  useOnClickOutside(mobileSearchRef, () => {
    if (isMobile && isSearchOpen) {
      setIsSearchOpen(false);
      clearSearch();
    }
  });

  // Fechar menu mobile ao clicar fora
  useOnClickOutside(mobileMenuRef, () => {
    if (isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

  // Fechar modais ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMobile) {
          if (isSearchOpen) {
            setIsSearchOpen(false);
            clearSearch();
          } else if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isSearchOpen, isMobileMenuOpen, clearSearch]);

  const handleMobileSearchClose = () => {
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
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
        "container flex items-center justify-between h-16",
        isMobile ? "px-3" : "px-6"
      )}>
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Mobile Menu Button com animação melhorada */}
          {isMobile && (
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "h-10 w-10 flex-shrink-0 rounded-xl transition-all duration-300",
                  isMobileMenuOpen 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "hover:bg-accent/80"
                )}
                aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          )}

          {/* Company Logo and Name com espaçamento otimizado */}
          <div className="min-w-0 flex-1 md:flex-initial">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyLogo />
            </motion.div>
          </div>

          {/* Desktop Breadcrumbs */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <BreadcrumbNav />
            </motion.div>
          )}
        </div>

        {/* Center Section - Search (Desktop only) */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="hidden md:flex"
          >
            <SearchBar 
              isMobile={isMobile}
              isSearchOpen={isSearchOpen}
              onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          </motion.div>
        )}

        {/* Right Section - Actions com melhor espaçamento */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center space-x-1 flex-shrink-0"
        >
          {/* Mobile Search Toggle */}
          {isMobile && (
            <SearchBar 
              isMobile={isMobile}
              isSearchOpen={isSearchOpen}
              onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          )}

          {/* Action buttons com animações */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ThemeToggle />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NotificationsMenu />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <UserMenu />
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile Navigation Menu com ref */}
      <div ref={mobileMenuRef}>
        <MobileNavMenu 
          isOpen={isMobileMenuOpen} 
          onClose={handleMobileMenuClose} 
        />
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
                    className="pl-10 pr-4 w-full rounded-xl border-2 focus:border-primary/50"
                    value={searchTerm}
                    onChange={(e) => performSearch(e.target.value)}
                    onKeyDown={handleMobileSearchKeyDown}
                    autoFocus
                  />
                </motion.div>
              </div>
              
              <GlobalSearchResults onResultClick={handleMobileSearchClose} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
