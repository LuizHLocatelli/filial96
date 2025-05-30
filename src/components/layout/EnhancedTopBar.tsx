
import { Link } from "react-router-dom";
import { Home, ChevronRight, Search, Menu, X } from "lucide-react";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileNavMenu } from "./MobileNavMenu";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { CompanyLogo } from "./CompanyLogo";
import { SearchBar } from "./SearchBar";

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

        {/* Center Section - Search */}
        {!isSearchOpen && (
          <SearchBar 
            isMobile={isMobile}
            isSearchOpen={isSearchOpen}
            onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
          />
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
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
      <MobileNavMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
}
