
export interface Sale {
  id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  valor: number;
  data_venda: string;
  status: 'pendente' | 'aprovada' | 'cancelada';
  observacoes?: string;
  arquivos?: Array<{
    nome: string;
    url: string;
  }>;
}
