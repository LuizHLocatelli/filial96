
export interface Orientacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_criacao: string;
  criado_por: string;
  criado_por_nome?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  data_entrega: string;
  data_criacao: string;
  data_atualizacao: string;
  status: string;
  criado_por: string;
  orientacao_id: string | null;
}
