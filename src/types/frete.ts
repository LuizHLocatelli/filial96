export interface FreteItem {
  codigo: string;
  descricao: string;
  quantidade: string;
  valor_unitario: string;
  valor_total_item: string;
}

export interface Frete {
  id: string;
  cpf_cliente?: string | null;
  nome_cliente: string;
  telefone: string;
  endereco_entrega: string;
  valor_total_nota?: number | null;
  valor_frete: number;
  pago: boolean;
  status: string;
  nota_fiscal_url?: string | null;
  itens: any; // JSON type from Supabase
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface NotaFiscalData {
  cpf_cliente: string;
  nome_cliente: string;
  itens: FreteItem[];
  valor_total_nota: string;
}