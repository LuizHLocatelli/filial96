
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
import { Calendar, ClipboardCheck, FileWarning, Home, Package, Users, Image, CreditCard, FileText, CalendarDays, Banknote, Coffee, KanbanSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  const pathStart = `/${location.pathname.split('/')[1]}`;
  
  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <Link to="/" className="flex items-center gap-2 px-4">
          <Home className="h-6 w-6 text-green-600" />
          <span className="font-bold text-lg text-green-700">Filial 96</span>
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
                <SidebarMenuButton asChild>
                  <Link to="/entregas">
                    <Package className="h-5 w-5" />
                    <span>Entregas/Retiradas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/montagens">
                    <ClipboardCheck className="h-5 w-5" />
                    <span>Montagens</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/garantias">
                    <FileWarning className="h-5 w-5" />
                    <span>Garantias</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/organizacao">
                    <Calendar className="h-5 w-5" />
                    <span>Organização</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/cobrancas">
                    <Users className="h-5 w-5" />
                    <span>Cobrança</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Crediário com submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathStart === "/crediario"}>
                  <Link to="/crediario">
                    <CreditCard className="h-5 w-5" />
                    <span>Crediário</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/crediario?tab=listagens">
                        <FileText className="h-4 w-4" />
                        <span>Listagens</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/crediario?tab=clientes">
                        <Users className="h-4 w-4" />
                        <span>Clientes</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/crediario?tab=depositos">
                        <Banknote className="h-4 w-4" />
                        <span>Depósitos</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/crediario?tab=folgas">
                        <Coffee className="h-4 w-4" />
                        <span>Folgas</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/crediario?tab=kanban">
                        <KanbanSquare className="h-4 w-4" />
                        <span>Quadro</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
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
