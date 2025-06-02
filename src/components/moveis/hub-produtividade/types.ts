import { LucideIcon } from 'lucide-react';

// ===== TIPOS EXISTENTES (Rotinas) =====
export interface Rotina {
  id: string;
  nome: string;
  descricao?: string;
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'personalizado';
  horario_preferencial?: string;
  dia_preferencial: string;
  categoria: string;
  ativo: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RotinaConclusao {
  id: string;
  rotina_id: string;
  data_conclusao: string;
  concluida: boolean;
  observacoes?: string;
  created_by: string;
  created_at: string;
}

export interface RotinaWithStatus extends Rotina {
  status: 'pendente' | 'concluida' | 'atrasada';
  conclusao?: RotinaConclusao;
  proximaData?: string;
}

// ===== TIPOS EXISTENTES (Orientações) =====
export interface Orientacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_criacao: string;
  criado_por: string;
  criado_por_nome?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  data_entrega: string;
  data_criacao: string;
  data_atualizacao: string;
  status: string;
  criado_por: string;
  orientacao_id: string | null;
}

// ===== NOVOS TIPOS PARA O HUB =====
export interface HubSection {
  id: string;
  title: string;
  icon: LucideIcon;
  component: React.ComponentType;
  badge?: number;
  description?: string;
}

export interface ProductivityStats {
  rotinas: {
    total: number;
    concluidas: number;
    pendentes: number;
    atrasadas: number;
    percentualConclusao: number;
  };
  orientacoes: {
    total: number;
    lidas: number;
    naoLidas: number;
    recentes: number;
  };
  tarefas: {
    total: number;
    concluidas: number;
    pendentes: number;
    atrasadas: number;
    percentualConclusao: number;
  };
  produtividade: {
    score: number;
    meta: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'rotina' | 'orientacao' | 'tarefa';
  title: string;
  description?: string;
  timestamp: string;
  status: 'concluida' | 'pendente' | 'atrasada' | 'nova';
  user: string;
  action: 'criada' | 'concluida' | 'atualizada' | 'deletada';
}

export interface HubFilters {
  searchTerm: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: 'todos' | 'pendente' | 'concluida' | 'atrasada';
  type: 'todos' | 'rotina' | 'orientacao' | 'tarefa';
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
export type StatusFilter = 'todos' | 'pendente' | 'concluida' | 'atrasada';
export type HubViewMode = 'dashboard' | 'rotinas' | 'orientacoes' | 'monitoramento' | 'tarefas';

// ===== TIPOS DE FORM DATA =====
export interface RotinaFormData {
  nome: string;
  descricao?: string;
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'personalizado';
  horario_preferencial?: string;
  dia_preferencial: string;
  categoria: string;
}

export interface TarefaFormData {
  titulo: string;
  descricao: string;
  data_entrega: string;
  orientacao_id?: string | null;
}

// ===== CONTEXTO DO HUB =====
export interface HubContextType {
  // Estado
  currentSection: HubViewMode;
  setCurrentSection: (section: HubViewMode) => void;
  
  // Dados
  stats: ProductivityStats;
  activities: ActivityItem[];
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingActivities: boolean;
  
  // Filters
  filters: HubFilters;
  setFilters: (filters: Partial<HubFilters>) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  exportData: (format: 'pdf' | 'excel') => Promise<void>;
}

// ===== NOVOS TIPOS PARA MONITORAMENTO =====
export interface OrientacaoVisualizacao {
  id: string;
  orientacao_id: string;
  user_id: string;
  user_role: string;
  viewed_at: string;
  created_at: string;
}

export interface UserPendente {
  id: string;
  name: string;
  role: string;
}

export interface RoleCompletionStats {
  role: string;
  total_users: number;
  viewed_users: number;
  completion_percentage: number;
  is_complete: boolean;
  pending_users: UserPendente[];
}

export interface OrientacaoMonitoramento {
  orientacao_id: string;
  titulo: string;
  tipo: string;
  data_criacao: string;
  viewing_stats: RoleCompletionStats[];
}

export interface MonitoramentoStats {
  total_orientacoes: number;
  orientacoes_completas: number;
  orientacoes_pendentes: number;
  percentage_complete: number;
  orientacoes: OrientacaoMonitoramento[];
}

export type TargetRole = 'consultor_moveis' | 'consultor_moda' | 'jovem_aprendiz';
