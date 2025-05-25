import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItemConfig } from "./menuConfig"; // Importa a interface

interface CollapsibleMenuItemProps {
  menuItem: MenuItemConfig;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  currentSearch: string;
}

export function CollapsibleMenuItem({
  menuItem,
  isOpen,
  onToggle,
  currentPath,
  currentSearch,
}: CollapsibleMenuItemProps) {
  const IconComponent = menuItem.icon;
  const isActive = menuItem.checkIsActive?.(currentPath, currentSearch, menuItem.path);

  return (
    <SidebarMenuItem className="relative">
      <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
        <div className="flex items-center w-full">
          <SidebarMenuButton 
            asChild 
            isActive={isActive} 
            className="flex-1"
          >
            <Link to={menuItem.path || "#"} className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              <span>{menuItem.label}</span>
            </Link>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <button 
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", 
                isOpen && "bg-sidebar-accent text-sidebar-accent-foreground"
              )} 
              aria-label={`Toggle ${menuItem.label} submenu`}
            >
              <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-90")} />
            </button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-1 ml-4 pl-2 border-l border-sidebar-border">
          {menuItem.subItems?.map(subItem => {
            const SubIconComponent = subItem.icon;
            const isSubItemActive = subItem.checkIsActive?.(currentPath, currentSearch, subItem.path);
            return (
              <SidebarMenuItem key={subItem.id}>
                <SidebarMenuButton asChild isActive={isSubItemActive}>
                  <Link to={subItem.path || "#"} className="flex items-center gap-2">
                    <SubIconComponent className="h-4 w-4" />
                    <span>{subItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
} 