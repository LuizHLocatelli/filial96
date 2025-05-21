
import { LucideIcon } from "lucide-react";

export interface InnerPage {
  name: string;
  url: string;
  icon?: LucideIcon;
}

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  hasInnerPages?: boolean;
  innerPages?: InnerPage[];
}

export interface NavBarProps {
  items: NavItem[];
  className?: string;
}
