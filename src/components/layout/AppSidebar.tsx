
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Calendar, ClipboardCheck, Home, Image, CreditCard, FileText, CalendarDays, Banknote, Coffee, KanbanSquare, Users, FolderArchive, Store, ChevronRight, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

export function AppSidebar() {
  const location = useLocation();
  const pathStart = `/${location.pathname.split('/')[1]}`;
  const { isDarkMode } = useTheme();
  
  // Estado para controlar quais submenus estão abertos
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    crediario: false,
  });

  // Função para alternar o estado de um submenu
  const toggleSubmenu = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center justify-center gap-2 px-4">
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700",
            isDarkMode ? "shadow-lg shadow-green-500/20" : ""
          )}>
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">FILIAL 96</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathStart === "/"}>
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Venda O menu item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathStart === "/venda-o"}>
                  <Link to="/venda-o" className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    <span>Venda O</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Crediário com submenu colapsável */}
              <SidebarMenuItem className="relative">
                <Collapsible 
                  open={openMenus.crediario} 
                  onOpenChange={() => toggleSubmenu('crediario')}
                  className="w-full"
                >
                  <div className="flex items-center w-full">
                    <SidebarMenuButton asChild isActive={pathStart === "/crediario"} className="flex-1">
                      <Link to="/crediario" className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Crediário</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <button 
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", 
                          openMenus.crediario && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                        aria-label="Toggle Crediário submenu"
                      >
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform", 
                          openMenus.crediario && "transform rotate-90"
                        )} />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="mt-1 ml-4 pl-2 border-l border-sidebar-border">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/crediario" && location.search === "?tab=listagens"}>
                        <Link to="/crediario?tab=listagens" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Listagens</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/crediario" && location.search === "?tab=clientes"}>
                        <Link to="/crediario?tab=clientes" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Clientes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/crediario" && location.search === "?tab=depositos"}>
                        <Link to="/crediario?tab=depositos" className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>Depósitos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/crediario" && location.search === "?tab=folgas"}>
                        <Link to="/crediario?tab=folgas" className="flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          <span>Folgas</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/crediario" && location.search === "?tab=kanban"}>
                        <Link to="/crediario?tab=kanban" className="flex items-center gap-2">
                          <KanbanSquare className="h-4 w-4" />
                          <span>Quadro</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/crediario" && location.search === "?tab=diretorio"}>
                        <Link to="/crediario?tab=diretorio" className="flex items-center gap-2">
                          <FolderArchive className="h-4 w-4" />
                          <span>Diretório</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathStart === "/cards-promocionais"}>
                  <Link to="/cards-promocionais" className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    <span>Cards Promocionais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
