export interface PastaGerencial {
  id: string;
  nome: string;
  pasta_pai_id: string | null;
  cor: string;
  icone: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ArquivoGerencial {
  id: string;
  nome_arquivo: string;
  caminho_storage: string;
  tipo_arquivo: string;
  tamanho_bytes: number;
  criado_por: string;
  resumo_ia: string | null;
  tags: string[] | null;
  pasta_id: string | null;
  created_at: string;
  updated_at: string;
}

export type UploadProgress = {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'analyzing' | 'completed' | 'error';
    error?: string;
  };
};