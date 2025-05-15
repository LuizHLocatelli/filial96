
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
} from "@/components/ui/sidebar";
import { 
  Calendar, 
  ClipboardCheck, 
  Home, 
  Image, 
  CreditCard, 
  FileText, 
  CalendarDays, 
  Banknote, 
  Coffee, 
  KanbanSquare, 
  Users, 
  FolderArchive, 
  Store 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  const pathStart = `/${location.pathname.split('/')[1]}`;
  
  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <Link to="/" className="flex items-center gap-2 px-4">
          <Home className="h-6 w-6 text-green-600" />
          <span className="font-bold text-lg text-green-700">FILIAL 96</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathStart === "/venda-o"}>
                  <Link to="/venda-o">
                    <Store className="h-5 w-5" />
                    <span>Venda O</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathStart === "/crediario" && !location.search.includes('tab=')}>
                  <Link to="/crediario">
                    <CreditCard className="h-5 w-5" />
                    <span>Crediário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('tab=listagens')}>
                  <Link to="/crediario?tab=listagens">
                    <FileText className="h-5 w-5" />
                    <span>Listagens</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('tab=clientes')}>
                  <Link to="/crediario?tab=clientes">
                    <Users className="h-5 w-5" />
                    <span>Clientes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('tab=depositos')}>
                  <Link to="/crediario?tab=depositos">
                    <Banknote className="h-5 w-5" />
                    <span>Depósitos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('tab=folgas')}>
                  <Link to="/crediario?tab=folgas">
                    <Coffee className="h-5 w-5" />
                    <span>Folgas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('tab=kanban')}>
                  <Link to="/crediario?tab=kanban">
                    <KanbanSquare className="h-5 w-5" />
                    <span>Quadro</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.search.includes('tab=diretorio')}>
                  <Link to="/crediario?tab=diretorio">
                    <FolderArchive className="h-5 w-5" />
                    <span>Diretório</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/cards-promocionais">
                    <Image className="h-5 w-5" />
                    <span>Cards Promocionais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        {/* Footer content */}
      </SidebarFooter>
    </Sidebar>
  );
}
