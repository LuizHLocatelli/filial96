
export interface ProdutoFoco {
  id: string;
  nome_produto: string;
  codigo_produto: string;
  categoria: string;
  preco_de: number;
  preco_por: number;
  periodo_inicio: string;
  periodo_fim: string;
  meta_vendas?: number;
  vendas_objetivo?: number;
  vendas_atual?: number;
  ativo: boolean;
  motivo_foco?: string;
  argumentos_venda?: string[];
  informacoes_adicionais?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProdutoFocoWithImages {
  id: string;
  nome_produto: string;
  codigo_produto: string;
  categoria: string;
  preco_de: number;
  preco_por: number;
  periodo_inicio: string;
  periodo_fim: string;
  meta_vendas?: number;
  vendas_objetivo?: number;
  vendas_atual?: number;
  ativo: boolean;
  motivo_foco?: string;
  argumentos_venda?: string[];
  informacoes_adicionais?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  imagens?: Array<{
    id: string;
    imagem_url: string;
    imagem_nome: string;
    ordem: number;
  }>;
}
