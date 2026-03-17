
import { LucideIcon } from "lucide-react";

export interface NavigationTab {
  title: string;
  icon: LucideIcon | string;
  path: string;
  permissionKey?: string;
}

export interface NavigationTabsProps {
  className?: string;
}

export interface TabButtonProps {
  tab: NavigationTab;
  index: number;
  isActive: boolean;
  isSmallScreen: boolean;
  isMobile: boolean;
  onTabClick: (index: number) => void;
  preloadProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export interface TabContainerProps {
  children: React.ReactNode;
  isMobile: boolean;
  isSmallScreen: boolean;
}
