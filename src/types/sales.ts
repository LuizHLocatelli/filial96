
export interface Sale {
  id: string;
  cliente_nome: string;
  valor: number;
  data_venda?: string;
  produto?: string;
  observacoes?: string;
  created_at?: string;
  created_by?: string;
}

export interface VendaO {
  id: string;
  cliente_nome: string;
  valor: number;
  data_venda?: string;
  produto?: string;
  observacoes?: string;
  created_at?: string;
  created_by?: string;
}
