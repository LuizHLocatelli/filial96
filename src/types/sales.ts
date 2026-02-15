
export interface Sale {
  id: string;
  cliente_nome: string;
  valor: number;
  data_venda?: string;
  produto?: string;
  observacoes?: string;
  created_at?: string;
  created_by?: string;
  status?: string;
  cliente_telefone?: string;
  arquivos?: Array<{
    nome: string;
    url: string;
  }>;
}
