
export interface Orientacao {
  id: string;
  titulo: string;
  tipo: "vm" | "informativo" | "outro";
  descricao: string;
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
  status: "pendente" | "em_andamento" | "concluida";
  orientacao_id: string | null;
  criado_por: string;
}
