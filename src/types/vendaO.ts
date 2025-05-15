
export interface VendaOProduct {
  nome: string;
  codigo: string;
}

export interface VendaO {
  id: string;
  filial: string;
  data_venda: string;
  nome_cliente: string;
  telefone?: string;
  produtos: VendaOProduct[];
  previsao_chegada?: string;
  tipo_entrega: 'frete' | 'retirada';
  status: 'aguardando_produto' | 'aguardando_cliente' | 'pendente' | 'concluida';
  created_at: string;
  updated_at: string;
  created_by?: string;
  attachments?: VendaOAttachment[];
}

export interface VendaOAttachment {
  id: string;
  sale_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size?: number;
  created_at: string;
  created_by?: string;
}

export const statusOptions = [
  { value: 'aguardando_produto', label: 'Aguardando Produto' },
  { value: 'aguardando_cliente', label: 'Aguardando Cliente' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluida', label: 'Concluída' },
];

export const entregaOptions = [
  { value: 'frete', label: 'Frete' },
  { value: 'retirada', label: 'Retirada' },
];
