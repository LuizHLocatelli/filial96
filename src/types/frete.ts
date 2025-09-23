// Tipos para o sistema de fretes renovado

export interface FreteItem {
  id?: string;
  frete_id?: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total_item: number;
  ordem?: number;
  created_at?: string;
  created_by?: string;
}

export interface Frete {
  id?: string;

  // Dados do cliente
  cpf_cliente?: string;
  nome_cliente: string;
  telefone: string;
  endereco_entrega: string;

  // Dados financeiros
  valor_total_nota?: number;
  valor_frete: number;
  pago: boolean;

  // Status e controle
  status: 'Pendente de Entrega' | 'Em Transporte' | 'Entregue' | 'Cancelado';

  // Arquivos
  nota_fiscal_url?: string;
  comprovante_entrega_url?: string;

  // Metadados de processamento
  processamento_ia_confidence?: number;
  processamento_ia_log_id?: string;

  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;

  // Itens (relação)
  items?: FreteItem[];
}

export interface FreteProcessingLog {
  id?: string;
  frete_id?: string;

  // Dados do processamento
  image_url: string;
  confidence_score: number;
  processing_time_ms: number;

  // Resultado
  success: boolean;
  raw_response?: string;
  error_message?: string;

  // Dados extraídos
  extracted_data?: NotaFiscalData;

  // Auditoria
  created_at?: string;
  created_by?: string;
}

export interface NotaFiscalData {
  cpf_cliente: string;
  nome_cliente: string;
  telefone?: string;
  endereco?: string;
  itens: {
    codigo: string;
    descricao: string;
    quantidade: string;
    valor_unitario: string;
    valor_total_item: string;
  }[];
  valor_total_nota: string;
}

export interface ProcessImageRequest {
  image_url?: string;
  image_data?: string; // base64
}

export interface ProcessImageResponse {
  success: boolean;
  data?: NotaFiscalData;
  error?: string;
  confidence?: number;
}

// Form data interfaces
export interface FreteFormData {
  cpf_cliente?: string;
  nome_cliente: string;
  telefone: string;
  endereco_entrega: string;
  valor_total_nota?: string;
  valor_frete: string;
  pago: boolean;
  status: Frete['status'];
  items: FreteItemFormData[];
}

export interface FreteItemFormData {
  codigo: string;
  descricao: string;
  quantidade: string;
  valor_unitario: string;
  valor_total_item: string;
}

// Hook return types
export interface UseFreteReturn {
  fretes: Frete[];
  loading: boolean;
  error: string | null;
  createFrete: (data: FreteFormData, notaFiscalUrl?: string) => Promise<boolean>;
  updateFrete: (id: string, data: Partial<FreteFormData>) => Promise<boolean>;
  deleteFrete: (id: string) => Promise<boolean>;
  refreshFretes: () => Promise<void>;
}

export interface UseImageProcessingReturn {
  processing: boolean;
  processImage: (imageUrl: string) => Promise<ProcessImageResponse | null>;
  error: string | null;
}

// Validation schemas
export interface FreteValidationErrors {
  nome_cliente?: string;
  telefone?: string;
  endereco_entrega?: string;
  valor_frete?: string;
  items?: string;
}