export interface ProcessImageResponse {
  success: boolean;
  data?: {
    nome_cliente?: string;
    cpf_cliente?: string;
    endereco_entrega?: string;
    telefone?: string;
    valor_frete?: number;
    valor_total_nota?: number;
    items?: FreteItem[];
  };
  error?: string;
  confidence?: number;
}

export interface FreteItem {
  codigo?: string;
  descricao: string;
  quantidade?: number;
  valor_unitario?: number;
  valor_total_item?: number;
}

export interface UseImageProcessingReturn {
  processing: boolean;
  error: string | null;
  processImage: (imageUrl: string) => Promise<ProcessImageResponse | null>;
}
