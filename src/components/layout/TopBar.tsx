
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar() {
  const sidebar = useSidebar();
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-3 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 md:hidden hover:bg-accent"
          onClick={() => sidebar.toggleSidebar()}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                FILIAL 96
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Sistema de Gestão
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
