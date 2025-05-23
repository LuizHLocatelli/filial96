
export interface ProdutoFoco {
  id: string;
  nome_produto: string;
  codigo_produto: string;
  categoria: string;
  preco_de: number;
  preco_por: number;
  periodo_inicio: string;
  periodo_fim: string;
  informacoes_adicionais?: string;
  motivo_foco?: string;
  meta_vendas?: number;
  argumentos_venda?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProdutoFocoImagem {
  id: string;
  produto_foco_id: string;
  imagem_url: string;
  imagem_nome: string;
  imagem_tipo: string;
  imagem_tamanho?: number;
  ordem: number;
  created_at: string;
  created_by: string;
}

export interface ProdutoFocoWithImages extends ProdutoFoco {
  imagens: ProdutoFocoImagem[];
}
