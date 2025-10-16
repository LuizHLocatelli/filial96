import { LucideIcon } from "lucide-react";

export interface ExternalLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  iconColor?: string;
}

export interface InternalTool {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
}

export interface PainelConfig {
  externalLinks: ExternalLink[];
  internalTools: InternalTool[];
}
