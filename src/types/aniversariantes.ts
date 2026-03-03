export interface Aniversariante {
  id: string;
  nome: string;
  filial: string;
  data_aniversario: string; // ISO format or YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}

export interface AniversarianteFormData {
  nome: string;
  filial: string;
  data_aniversario: string;
}
