import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
// import { cn } from "@/lib/utils"; // Não é mais usado diretamente aqui
// import { useTheme } from "@/contexts/ThemeContext"; // Não é mais usado aqui
// Ícones individuais não são mais importados aqui, vêm da config
import { menuItems, MenuItemConfig } from "./menuConfig";
import { CollapsibleMenuItem } from "./CollapsibleMenuItem";

export function AppSidebar() {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.isCollapsible) {
        // Usa defaultOpen da config, ou false se não definido
        initialState[item.id] = item.defaultOpen || false;
      }
    });
    return initialState;
  });

  const toggleSubmenu = (menuId: string) => {
    setOpenMenus(prevOpenMenus => ({
      ...prevOpenMenus,
      [menuId]: !prevOpenMenus[menuId],
    }));
  };

  const renderMenuItem = (item: MenuItemConfig) => {
    const Icon = item.icon; // Renomeado para evitar conflito de nomeação
    const isActive = item.checkIsActive?.(location.pathname, location.search, item.path);

    if (item.isCollapsible && item.subItems && item.subItems.length > 0) {
      return (
        <CollapsibleMenuItem
          key={item.id}
          menuItem={item}
          isOpen={openMenus[item.id] || false}
          onToggle={() => toggleSubmenu(item.id)}
          currentPath={location.pathname}
          currentSearch={location.search}
        />
      );
    }

    // Item de menu simples, não colapsável
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link to={item.path || "#"} className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/lovable-uploads/c066d606-7e09-418e-a6ff-c3a603ac88c9.png" 
            alt="Filial 96 Logo" 
            className="h-10 w-auto" 
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60 text-center">
          &copy; {new Date().getFullYear()} Filial 96
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}