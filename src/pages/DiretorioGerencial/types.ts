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

export interface PastaComCounts extends PastaGerencial {
  subfolders_count: number;
  files_count: number;
  total_items: number;
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

export type UploadStatus = "pending" | "uploading" | "analyzing" | "completed" | "error";

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface UploadItem {
  id: string;
  file: File;
  customName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface FileWithUrl {
  arquivo: ArquivoGerencial;
  url: string;
}

export interface BreadcrumbItem {
  id: string | null;
  nome: string;
}

export interface DialogState {
  type: "create" | "edit" | "delete" | "move" | null;
  itemType: "pasta" | "arquivo" | null;
  selectedId: string | null;
}

export type FolderDialogMode = "create" | "edit" | "rename";

export interface FolderFormData {
  nome: string;
  cor?: string;
  icone?: string;
}
