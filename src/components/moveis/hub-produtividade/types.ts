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

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string | null;
  data_entrega: string;
  data_criacao: string;
  data_atualizacao: string;
  criado_por: string;
  origem: string | null;
  rotina_id: string | null;
}

export interface ProductivityStats {
  produtividade: {
    score: number;
  };
  tarefas: {
    total: number;
    concluidas: number;
    pendentes: number;
    atrasadas: number;
  };
  rotinas: {
    total: number;
    concluidas: number;
    pendentes: number;
  };
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

// ===== CONTEXTO DO HUB =====
export interface HubContextType {
  // Estado
  currentSection: HubViewMode;
  setCurrentSection: (section: HubViewMode) => void;
  
  // Dados
  stats: ProductivityStats;
  
  // Loading states
  isLoadingStats: boolean;
  
  // Filters
  filters: HubFilters;
  setFilters: (filters: Partial<HubFilters>) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  exportData: (format: 'pdf' | 'excel') => Promise<void>;
}


