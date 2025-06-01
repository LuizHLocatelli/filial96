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

export type PeriodicidadeFilter = 'todos' | 'hoje' | 'semana' | 'mes';
export type StatusFilter = 'todos' | 'pendente' | 'concluida' | 'atrasada';

export interface RotinaFormData {
  nome: string;
  descricao?: string;
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'personalizado';
  horario_preferencial?: string;
  dia_preferencial: string;
  categoria: string;
}
