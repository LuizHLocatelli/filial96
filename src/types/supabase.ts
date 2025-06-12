
export interface Database {
  public: {
    Tables: {
      metas_categorias: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          icone: string | null;
          cor: string;
          ativo: boolean;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          icone?: string | null;
          cor?: string;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          icone?: string | null;
          cor?: string;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      metas_mensais: {
        Row: {
          id: string;
          categoria_id: string;
          mes_ano: string;
          valor_meta: number;
          descricao: string | null;
          ativo: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_id: string;
          mes_ano: string;
          valor_meta: number;
          descricao?: string | null;
          ativo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria_id?: string;
          mes_ano?: string;
          valor_meta?: number;
          descricao?: string | null;
          ativo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      metas_funcionarios: {
        Row: {
          id: string;
          funcionario_id: string;
          categoria_id: string;
          mes_ano: string;
          valor_meta: number;
          observacoes: string | null;
          ativo: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          funcionario_id: string;
          categoria_id: string;
          mes_ano: string;
          valor_meta: number;
          observacoes?: string | null;
          ativo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          funcionario_id?: string;
          categoria_id?: string;
          mes_ano?: string;
          valor_meta?: number;
          observacoes?: string | null;
          ativo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      metas_foco: {
        Row: {
          id: string;
          data_foco: string;
          categoria_id: string;
          valor_meta: number;
          titulo: string;
          descricao: string | null;
          ativo: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data_foco: string;
          categoria_id: string;
          valor_meta: number;
          titulo: string;
          descricao?: string | null;
          ativo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          data_foco?: string;
          categoria_id?: string;
          valor_meta?: number;
          titulo?: string;
          descricao?: string | null;
          ativo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_metas_dashboard_data: {
        Args: {
          mes_ref?: string;
        };
        Returns: any;
      };
    };
  };
}
