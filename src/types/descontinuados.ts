
export interface ProdutoDescontinuado {
  id: string;
  nome: string;
  codigo: string;
  categoria: 'Linha Branca' | 'Som e Imagem' | 'Telefonia' | 'Linha Móveis' | 'Eletroportáteis' | 'Tecnologia' | 'Automotivo';
  preco: number;
  descricao?: string;
  percentual_desconto?: number;
  quantidade_estoque?: number;
  imagem_url?: string;
  imagem_nome?: string;
  imagem_tipo?: string;
  imagem_tamanho?: number;
  favorito: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProdutoDescontinuadoFormData {
  nome: string;
  codigo: string;
  categoria: string;
  preco: number;
  descricao?: string;
  percentual_desconto?: number;
  quantidade_estoque?: number;
}

export interface DescontinuadosFilters {
  categoria: string;
  search: string;
  preco_min?: number;
  preco_max?: number;
  ordenacao: 'nome' | 'preco_asc' | 'preco_desc' | 'mais_recentes';
}
