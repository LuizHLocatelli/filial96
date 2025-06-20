
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
