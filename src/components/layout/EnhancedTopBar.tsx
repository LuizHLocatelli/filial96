
import { Link } from "react-router-dom";
import { Home, ChevronRight, Search, Menu, X } from "lucide-react";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNavMenu } from "./MobileNavMenu";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { CompanyLogo } from "./CompanyLogo";

export function EnhancedTopBar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10"
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
          <CompanyLogo />

          {/* Desktop Breadcrumbs */}
          {!isMobile && <BreadcrumbNav />}
        </div>

        {/* Center Section - Search (Desktop) */}
        {!isMobile && !isSearchOpen && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 pr-4 w-full bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-10 w-10"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <ThemeToggle />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobile && isSearchOpen && (
        <div className="border-t bg-background/95 backdrop-blur-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10 pr-4 w-full"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      <MobileNavMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
}
