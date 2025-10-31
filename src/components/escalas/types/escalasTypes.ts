export type TipoEscala = 'trabalho' | 'folga' | 'feriado_trabalhado' | 'domingo_trabalhado';

export interface Escala {
  id: string;
  funcionario_id: string;
  funcionario_nome?: string;
  funcionario_email?: string;
  data: string;
  tipo: TipoEscala;
  eh_abertura: boolean;
  eh_fechamento: boolean;
  folga_compensatoria_id?: string | null;
  observacao?: string | null;
  modo_teste: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feriado {
  id: string;
  data: string;
  nome: string;
  eh_trabalhado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracaoEscala {
  id: string;
  regra: string;
  ativa: boolean;
  parametros: {
    mensagem?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ConflitosEscala {
  tipo_conflito: 'folga_sexta' | 'sem_folga_compensatoria' | 'domingo_sem_sabado';
  data: string;
  mensagem: string;
}

export interface DiaCalendario {
  dia: number;
  data: string;
  ehDomingo: boolean;
  ehSabado: boolean;
  ehFeriado: boolean;
  feriado?: Feriado;
  escalas: Escala[];
  conflitos: ConflitosEscala[];
}

export interface EscalaFormData {
  funcionario_id: string;
  data: string;
  tipo: TipoEscala;
  eh_abertura?: boolean;
  eh_fechamento?: boolean;
  folga_compensatoria_id?: string | null;
  observacao?: string;
  modo_teste: boolean;
}

export interface ValidacaoEscala {
  valido: boolean;
  erros: string[];
  avisos: string[];
}

export interface Funcionario {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}
