
export interface MetaCategoria {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string;
  ordem: number;
  valor_meta_mensal: number;
  meta_mensal_id: string | null;
  funcionarios_metas: FuncionarioMeta[];
}

export interface FuncionarioMeta {
  funcionario_id: string;
  funcionario_nome: string;
  funcionario_role: string;
  valor_meta: number;
  observacoes: string | null;
}

export interface MetaFoco {
  id: string;
  data_foco: string;
  categoria_id: string;
  categoria_nome: string;
  categoria_icone: string;
  categoria_cor: string;
  valor_meta: number;
  titulo: string;
  descricao: string | null;
}

export interface MetasDashboardData {
  categorias: MetaCategoria[];
  meta_foco_ativa: MetaFoco | null;
  mes_referencia: string;
}

export interface MetaMensalForm {
  categoria_id: string;
  valor_meta: number;
  descricao?: string;
}

export interface MetaFocoForm {
  data_foco: string;
  categoria_id: string;
  valor_meta: number;
  titulo: string;
  descricao?: string;
}
