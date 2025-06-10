
export interface Orientacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'vm' | 'informativo' | 'outro';
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_criacao: string;
  criado_por: string;
  criado_por_nome?: string; // Added this property
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'concluida' | 'atrasada';
  prioridade: 'alta' | 'media' | 'baixa';
  data_entrega: string;
  data_criacao: string;
  data_atualizacao: string;
  criado_por: string;
  rotina_id?: string;
  orientacao_id?: string;
  origem: 'manual' | 'rotina' | 'orientacao';
  created_at: string; // Added this property to base Tarefa
  creator?: {
    id: string;
    nome: string;
    role: string;
  };
}

export interface TarefaExpandida extends Tarefa {
  creator?: {
    id: string;
    nome: string;
    role: string;
  };
  created_at: string;
}

export interface TarefaWithCreator extends Tarefa {
  creator?: {
    id: string;
    nome: string;
    role: string;
  };
  created_at: string;
}

// Add RotinaWithStatus interface for compatibility
export interface RotinaWithStatus {
  id: string;
  nome: string;
  titulo: string; // Added this property
  descricao?: string;
  categoria?: string;
  status?: string;
  periodicidade?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type OrientacaoFormData = Omit<Orientacao, 'id' | 'data_criacao' | 'criado_por' | 'criado_por_nome'>;
export type TarefaFormData = Omit<Tarefa, 'id' | 'data_criacao' | 'data_atualizacao' | 'criado_por' | 'created_at' | 'creator'>;
