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
  gera_tarefa_automatica?: boolean;
  template_tarefa?: {
    titulo?: string;
    descricao?: string;
    prazo_dias?: number;
  };
  tarefas_relacionadas?: string[];
}

export interface RotinaConclusao {
  id: string;
  rotina_id: string;
  data_conclusao: string;
  concluida: boolean;
  observacoes?: string;
  created_by: string;
  created_at: string;
  tarefa_gerada_id?: string;
}

export interface RotinaWithStatus extends Rotina {
  status: 'pendente' | 'concluida' | 'atrasada';
  conclusao?: RotinaConclusao;
  proximaData?: string;
  tarefas_stats?: {
    total: number;
    concluidas: number;
    pendentes: number;
    atrasadas: number;
  };
}

export type PeriodicidadeFilter = 'todos' | 'hoje' | 'semana' | 'mes';
export type StatusFilter = 'todos' | 'pendente' | 'concluida' | 'atrasada';

export interface RotinaFormData {
  nome: string;
  descricao?: string;
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'personalizado';
  horario_preferencial?: string;
  dia_preferencial: string;
  categoria: string;
  gera_tarefa_automatica?: boolean;
  template_tarefa?: {
    titulo?: string;
    descricao?: string;
    prazo_dias?: number;
  };
}
