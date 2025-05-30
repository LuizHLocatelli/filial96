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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container flex items-center justify-between h-16 px-3 md:px-6">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 flex-shrink-0"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Company Logo and Name */}
          <div className="min-w-0 flex-1 md:flex-initial">
            <CompanyLogo />
          </div>

          {/* Desktop Breadcrumbs */}
          {!isMobile && <BreadcrumbNav />}
        </div>

        {/* Center Section - Search (Desktop only) */}
        {!isMobile && (
          <SearchBar 
            isMobile={isMobile}
            isSearchOpen={isSearchOpen}
            onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
          />
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          {/* Mobile Search Toggle */}
          {isMobile && (
            <SearchBar 
              isMobile={isMobile}
              isSearchOpen={isSearchOpen}
              onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          )}

          <ThemeToggle />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div ref={mobileMenuRef}>
        <MobileNavMenu 
          isOpen={isMobileMenuOpen} 
          onClose={handleMobileMenuClose} 
        />
      </div>

      {/* Mobile Search Expandable */}
      {isMobile && isSearchOpen && (
        <div className="border-t bg-background/95 backdrop-blur-lg p-4 relative" ref={mobileSearchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar páginas, seções..."
              className="pl-10 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => performSearch(e.target.value)}
              onKeyDown={handleMobileSearchKeyDown}
              autoFocus
            />
          </div>
          <GlobalSearchResults onResultClick={handleMobileSearchClose} />
        </div>
      )}
    </header>
  );
}
