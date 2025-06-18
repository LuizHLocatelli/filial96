// Interface para atividades do banco
export interface DatabaseActivity {
  id: string;
  action: string;
  task_id: string;
  task_title: string;
  task_type: string;
  timestamp: string;
  user_id: string;
  user_name: string;
}

// Interface compatível com ActivityTimeline
export interface ActivityItem {
  id: string;
  type: 'tarefa' | 'rotina' | 'orientacao';
  title: string;
  description?: string;
  timestamp: string;
  status: 'concluida' | 'pendente' | 'atrasada' | 'nova';
  user: string;
  action: 'criada' | 'concluida' | 'atualizada' | 'deletada';
}

export interface ActivityStats {
  total: number;
  completed: number;
  pending: number;
  recent: number;
}

export interface ActivityFilters {
  searchTerm: string;
  typeFilter: string;
  actionFilter: string;
  dateRange: string;
  userFilter: string;
} 