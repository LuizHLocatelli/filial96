import { Home, Image, CreditCard, FileText, Coffee, Sofa, Users, FolderArchive, Star, Calendar, ClipboardCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  checkIsActive?: (currentPath: string, currentSearch: string, itemPath?: string) => boolean;
  subItems?: MenuItemConfig[];
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const defaultIsActive = (
  currentPath: string, 
  currentSearch: string, 
  itemPath?: string
) => {
  if (!itemPath) return false;
  const pathStart = `/${currentPath.split('/')[1]}`;
  return pathStart === itemPath;
};

const subItemIsActive = (
  currentPath: string, 
  currentSearch: string, 
  itemPath?: string // itemPath aqui seria o path completo com query params
) => {
  if (!itemPath) return false;
  const [path, query] = itemPath.split('?');
  return currentPath === path && (query ? currentSearch === `?${query}` : true);
};

export const menuItems: MenuItemConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/",
    checkIsActive: defaultIsActive,
  },
  {
    id: "moveis",
    label: "Móveis",
    icon: Sofa,
    path: "/moveis", // Path base para o grupo
    isCollapsible: true,
    defaultOpen: false, // Ou true se quiser que comece aberto
    checkIsActive: defaultIsActive, // Verifica se a seção principal "/moveis" está ativa
    subItems: [
      {
        id: "moveis-orientacoes",
        label: "Orientações",
        icon: FileText,
        path: "/moveis?tab=orientacoes",
        checkIsActive: subItemIsActive,
      },
      {
        id: "moveis-diretorio",
        label: "Diretório",
        icon: FolderArchive,
        path: "/moveis?tab=diretorio",
        checkIsActive: subItemIsActive,
      },
      {
        id: "moveis-vendao",
        label: "Venda O",
        icon: ClipboardCheck,
        path: "/moveis?tab=vendao",
        checkIsActive: subItemIsActive,
      },
      {
        id: "moveis-produtofoco",
        label: "Produto Foco",
        icon: Star,
        path: "/moveis?tab=produto-foco",
        checkIsActive: subItemIsActive,
      },
      {
        id: "moveis-folgas",
        label: "Folgas",
        icon: Calendar,
        path: "/moveis?tab=folgas",
        checkIsActive: subItemIsActive,
      },
    ],
  },
  {
    id: "crediario",
    label: "Crediário",
    icon: CreditCard,
    path: "/crediario", // Path base para o grupo
    isCollapsible: true,
    defaultOpen: false,
    checkIsActive: defaultIsActive,
    subItems: [
      {
        id: "crediario-listagens",
        label: "Listagens",
        icon: FileText,
        path: "/crediario?tab=listagens",
        checkIsActive: subItemIsActive,
      },
      {
        id: "crediario-clientes",
        label: "Clientes",
        icon: Users,
        path: "/crediario?tab=clientes",
        checkIsActive: subItemIsActive,
      },
      {
        id: "crediario-depositos",
        label: "Depósitos",
        icon: Calendar, // Poderia ser um ícone diferente se desejado
        path: "/crediario?tab=depositos",
        checkIsActive: subItemIsActive,
      },
      {
        id: "crediario-folgas",
        label: "Folgas",
        icon: Coffee,
        path: "/crediario?tab=folgas",
        checkIsActive: subItemIsActive,
      },
      {
        id: "crediario-diretorio",
        label: "Diretório",
        icon: FolderArchive,
        path: "/crediario?tab=diretorio",
        checkIsActive: subItemIsActive,
      },
    ],
  },
  {
    id: "cards",
    label: "Cards",
    icon: Image,
    path: "/cards-promocionais",
    checkIsActive: defaultIsActive,
  },
]; 