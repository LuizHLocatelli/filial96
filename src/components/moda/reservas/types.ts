
export interface ModaReserva {
  id: string;
  produto_nome: string;
  produto_codigo: string;
  tamanho?: string;
  quantidade: number;
  cliente_nome: string;
  cliente_cpf: string;
  consultora_id: string;
  forma_pagamento: 'crediario' | 'cartao_credito' | 'cartao_debito' | 'pix';
  data_reserva: string;
  data_expiracao: string;
  status: 'ativa' | 'expirada' | 'convertida' | 'cancelada';
  venda_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ReservaFormData {
  produto_nome: string;
  produto_codigo: string;
  tamanho?: string;
  quantidade: number;
  cliente_nome: string;
  cliente_cpf: string;
  forma_pagamento: 'crediario' | 'cartao_credito' | 'cartao_debito' | 'pix';
  observacoes?: string;
}

export interface ReservasStats {
  total_ativas: number;
  expirando_24h: number;
  taxa_conversao: number;
  valor_total_reservado: number;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
}
