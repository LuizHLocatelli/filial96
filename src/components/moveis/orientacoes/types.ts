
export interface Orientacao {
  id: string;
  titulo: string;
  tipo: string;
  descricao: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  data_criacao: string;
  criado_por: string;
  created_at?: string;
  user_name?: string;
  conteudo?: string;
  anexos?: Array<{
    nome: string;
    url: string;
  }>;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  data_entrega: string;
  criado_por: string;
  data_criacao: string;
  data_atualizacao: string;
  prioridade?: string;
  orientacao_id?: string;
  rotina_id?: string;
  origem?: string;
}

export interface TarefaExpandida extends Tarefa {
  criador_nome?: string;
  rotina_nome?: string;
}
