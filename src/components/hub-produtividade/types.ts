import { LucideIcon } from 'lucide-react';

// ===== TIPOS PARA O HUB =====
export interface HubSection {
  id: string;
  title: string;
  icon: LucideIcon;
  component: React.ComponentType;
  badge?: number;
  description?: string;
}

export interface HubFilters {
  searchTerm: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  categoria: string;
  usuario: string;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  color: string;
  icon: LucideIcon;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
}

// ===== TIPOS DE FILTROS =====
export type PeriodicidadeFilter = 'todos' | 'hoje' | 'semana' | 'mes';
export type HubViewMode = 'dashboard' | 'monitoramento';


