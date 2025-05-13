
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu";
import { UserMenu } from "../auth/UserMenu";

export function TopBar() {
  const sidebar = useSidebar();
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center px-3 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 md:hidden"
          onClick={() => sidebar.toggleSidebar()}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-semibold hidden md:inline-block">
              Juntos a Gente Resolve
            </span>
            <span className="text-lg font-semibold md:hidden">
              JAR
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
