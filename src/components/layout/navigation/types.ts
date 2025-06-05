
import { LucideIcon } from "lucide-react";

export interface NavigationTab {
  title: string;
  icon: LucideIcon;
  path: string;
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
}

export interface TabContainerProps {
  children: React.ReactNode;
  isMobile: boolean;
  isSmallScreen: boolean;
}
