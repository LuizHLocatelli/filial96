
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

export function TopBar() {
  const sidebar = useSidebar();
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`container flex items-center ${isMobile ? 'h-12 px-2' : 'h-14 px-3 md:px-6'}`}>
        <Button
          variant="ghost"
          size="icon"
          className={`${isMobile ? 'mr-2 h-9 w-9' : 'mr-4'} md:hidden hover:bg-accent`}
          onClick={() => sidebar.toggleSidebar()}
        >
          <Menu className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex flex-col">
              <span className={`font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>
                FILIAL 96
              </span>
              {!isMobile && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Sistema de Gestão
                </span>
              )}
            </div>
          </Link>
          
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1 sm:gap-2'}`}>
            <ThemeToggle />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
