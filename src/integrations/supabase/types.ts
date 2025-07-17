export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          task_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          task_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          task_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      card_folders: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          sector: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          sector: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          sector?: string
        }
        Relationships: []
      }
      cartaz_folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cartazes: {
        Row: {
          created_at: string | null
          created_by: string
          file_type: string
          file_url: string
          folder_id: string | null
          id: string
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          file_type: string
          file_url: string
          folder_id?: string | null
          id?: string
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          file_type?: string
          file_url?: string
          folder_id?: string | null
          id?: string
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cartazes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "cartaz_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_goals: {
        Row: {
          consultant_id: string
          created_at: string | null
          goal_id: string
          id: string
          monthly_goal: number
          updated_at: string | null
        }
        Insert: {
          consultant_id: string
          created_at?: string | null
          goal_id: string
          id?: string
          monthly_goal: number
          updated_at?: string | null
        }
        Update: {
          consultant_id?: string
          created_at?: string | null
          goal_id?: string
          id?: string
          monthly_goal?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultant_goals_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultant_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_clientes: {
        Row: {
          conta: string
          contratos_negociados: string | null
          created_at: string | null
          created_by: string | null
          dia_contato: string
          dia_pagamento: string
          id: string
          indicator: string | null
          nome: string
          observacao: string | null
          qtd_parcelas: string | null
          tipo: string
          valor_cada_parcela: string | null
          valor_entrada: string | null
          valor_parcelas: string | null
        }
        Insert: {
          conta: string
          contratos_negociados?: string | null
          created_at?: string | null
          created_by?: string | null
          dia_contato: string
          dia_pagamento: string
          id?: string
          indicator?: string | null
          nome: string
          observacao?: string | null
          qtd_parcelas?: string | null
          tipo: string
          valor_cada_parcela?: string | null
          valor_entrada?: string | null
          valor_parcelas?: string | null
        }
        Update: {
          conta?: string
          contratos_negociados?: string | null
          created_at?: string | null
          created_by?: string | null
          dia_contato?: string
          dia_pagamento?: string
          id?: string
          indicator?: string | null
          nome?: string
          observacao?: string | null
          qtd_parcelas?: string | null
          tipo?: string
          valor_cada_parcela?: string | null
          valor_entrada?: string | null
          valor_parcelas?: string | null
        }
        Relationships: []
      }
      crediario_depositos: {
        Row: {
          comprovante: string | null
          concluido: boolean | null
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          ja_incluido: boolean | null
        }
        Insert: {
          comprovante?: string | null
          concluido?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data: string
          id?: string
          ja_incluido?: boolean | null
        }
        Update: {
          comprovante?: string | null
          concluido?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          ja_incluido?: boolean | null
        }
        Relationships: []
      }
      crediario_depositos_statistics: {
        Row: {
          average_deposit_hour: number | null
          complete_days: number
          completion_rate: number
          created_at: string | null
          current_streak: number
          deposits_after_12h: number
          deposits_before_10h: number
          id: string
          last_calculated_at: string | null
          max_streak_month: number
          missed_days: number
          month_year: string
          partial_days: number
          punctuality_rate: number
          updated_at: string | null
          user_id: string
          working_days: number
        }
        Insert: {
          average_deposit_hour?: number | null
          complete_days?: number
          completion_rate?: number
          created_at?: string | null
          current_streak?: number
          deposits_after_12h?: number
          deposits_before_10h?: number
          id?: string
          last_calculated_at?: string | null
          max_streak_month?: number
          missed_days?: number
          month_year: string
          partial_days?: number
          punctuality_rate?: number
          updated_at?: string | null
          user_id: string
          working_days?: number
        }
        Update: {
          average_deposit_hour?: number | null
          complete_days?: number
          completion_rate?: number
          created_at?: string | null
          current_streak?: number
          deposits_after_12h?: number
          deposits_before_10h?: number
          id?: string
          last_calculated_at?: string | null
          max_streak_month?: number
          missed_days?: number
          month_year?: string
          partial_days?: number
          punctuality_rate?: number
          updated_at?: string | null
          user_id?: string
          working_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "crediario_depositos_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_directory_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      crediario_directory_files: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_featured?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_featured?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crediario_directory_files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "crediario_directory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_folgas: {
        Row: {
          created_at: string | null
          created_by: string | null
          crediarista_id: string
          data: string
          id: string
          motivo: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          crediarista_id: string
          data: string
          id?: string
          motivo?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          crediarista_id?: string
          data?: string
          id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crediario_folgas_crediarista_id_fkey"
            columns: ["crediarista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_kanban_activities: {
        Row: {
          action: string
          board_id: string
          card_id: string | null
          created_at: string | null
          created_by: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          board_id: string
          card_id?: string | null
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          board_id?: string
          card_id?: string | null
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crediario_kanban_activities_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crediario_kanban_activities_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_kanban_boards: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crediario_kanban_card_tags: {
        Row: {
          card_id: string
          id: string
          tag_id: string
        }
        Insert: {
          card_id: string
          id?: string
          tag_id: string
        }
        Update: {
          card_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crediario_kanban_card_tags_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crediario_kanban_card_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_kanban_cards: {
        Row: {
          assignee_id: string | null
          background_color: string | null
          column_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          position: number
          priority: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          background_color?: string | null
          column_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          position?: number
          priority?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          background_color?: string | null
          column_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          position?: number
          priority?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crediario_kanban_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crediario_kanban_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_kanban_columns: {
        Row: {
          board_id: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          board_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          board_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crediario_kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_kanban_comments: {
        Row: {
          card_id: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          card_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          card_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crediario_kanban_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "crediario_kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      crediario_kanban_tags: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      crediario_listagens: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          indicator: string | null
          nome: string
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          indicator?: string | null
          nome: string
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          indicator?: string | null
          nome?: string
          url?: string
        }
        Relationships: []
      }
      crediario_sticky_notes: {
        Row: {
          color: string
          content: string
          created_at: string | null
          created_by: string | null
          folder_id: string | null
          id: string
          position_x: number | null
          position_y: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          content: string
          created_at?: string | null
          created_by?: string | null
          folder_id?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          folder_id?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crediario_sticky_notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          goal_type: string
          id: string
          month: string
          monthly_goal: number
          sector_name: string
          team: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_type: string
          id?: string
          month: string
          monthly_goal: number
          sector_name: string
          team: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_type?: string
          id?: string
          month?: string
          monthly_goal?: number
          sector_name?: string
          team?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      metas_categorias: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      metas_foco: {
        Row: {
          ativo: boolean | null
          categoria_id: string
          created_at: string | null
          created_by: string | null
          data_foco: string
          descricao: string | null
          id: string
          titulo: string
          updated_at: string | null
          valor_meta: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_id: string
          created_at?: string | null
          created_by?: string | null
          data_foco: string
          descricao?: string | null
          id?: string
          titulo: string
          updated_at?: string | null
          valor_meta: number
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string
          created_at?: string | null
          created_by?: string | null
          data_foco?: string
          descricao?: string | null
          id?: string
          titulo?: string
          updated_at?: string | null
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_foco_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "metas_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_foco_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_funcionarios: {
        Row: {
          ativo: boolean | null
          categoria_id: string
          created_at: string | null
          created_by: string | null
          funcionario_id: string
          id: string
          mes_ano: string
          observacoes: string | null
          updated_at: string | null
          valor_meta: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_id: string
          created_at?: string | null
          created_by?: string | null
          funcionario_id: string
          id?: string
          mes_ano: string
          observacoes?: string | null
          updated_at?: string | null
          valor_meta: number
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string
          created_at?: string | null
          created_by?: string | null
          funcionario_id?: string
          id?: string
          mes_ano?: string
          observacoes?: string | null
          updated_at?: string | null
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_funcionarios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "metas_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_funcionarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_funcionarios_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_mensais: {
        Row: {
          ativo: boolean | null
          categoria_id: string
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          mes_ano: string
          updated_at: string | null
          valor_meta: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_id: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          mes_ano: string
          updated_at?: string | null
          valor_meta: number
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          mes_ano?: string
          updated_at?: string | null
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_mensais_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "metas_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_mensais_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moda_arquivos: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_featured?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_featured?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moda_arquivos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "moda_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      moda_categorias: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      moda_folgas: {
        Row: {
          consultor_id: string
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          motivo: string | null
        }
        Insert: {
          consultor_id: string
          created_at?: string | null
          created_by?: string | null
          data: string
          id?: string
          motivo?: string | null
        }
        Update: {
          consultor_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          motivo?: string | null
        }
        Relationships: []
      }
      moda_produto_foco: {
        Row: {
          argumentos_venda: string[] | null
          ativo: boolean | null
          categoria: string
          codigo_produto: string
          created_at: string | null
          created_by: string
          id: string
          informacoes_adicionais: string | null
          meta_vendas: number | null
          motivo_foco: string | null
          nome_produto: string
          periodo_fim: string
          periodo_inicio: string
          preco_de: number
          preco_por: number
          updated_at: string | null
        }
        Insert: {
          argumentos_venda?: string[] | null
          ativo?: boolean | null
          categoria: string
          codigo_produto: string
          created_at?: string | null
          created_by: string
          id?: string
          informacoes_adicionais?: string | null
          meta_vendas?: number | null
          motivo_foco?: string | null
          nome_produto: string
          periodo_fim: string
          periodo_inicio: string
          preco_de: number
          preco_por: number
          updated_at?: string | null
        }
        Update: {
          argumentos_venda?: string[] | null
          ativo?: boolean | null
          categoria?: string
          codigo_produto?: string
          created_at?: string | null
          created_by?: string
          id?: string
          informacoes_adicionais?: string | null
          meta_vendas?: number | null
          motivo_foco?: string | null
          nome_produto?: string
          periodo_fim?: string
          periodo_inicio?: string
          preco_de?: number
          preco_por?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      moda_produto_foco_imagens: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          imagem_nome: string
          imagem_tamanho: number | null
          imagem_tipo: string
          imagem_url: string
          ordem: number | null
          produto_foco_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          imagem_nome: string
          imagem_tamanho?: number | null
          imagem_tipo: string
          imagem_url: string
          ordem?: number | null
          produto_foco_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          imagem_nome?: string
          imagem_tamanho?: number | null
          imagem_tipo?: string
          imagem_url?: string
          ordem?: number | null
          produto_foco_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moda_produto_foco_imagens_produto_foco_id_fkey"
            columns: ["produto_foco_id"]
            isOneToOne: false
            referencedRelation: "moda_produto_foco"
            referencedColumns: ["id"]
          },
        ]
      }
      moda_produto_foco_vendas: {
        Row: {
          cliente_nome: string
          cliente_telefone: string | null
          created_at: string | null
          created_by: string
          data_venda: string
          id: string
          observacoes: string | null
          produto_codigo: string
          produto_foco_id: string | null
          produto_nome: string
          quantidade: number
          valor_total: number
        }
        Insert: {
          cliente_nome: string
          cliente_telefone?: string | null
          created_at?: string | null
          created_by: string
          data_venda: string
          id?: string
          observacoes?: string | null
          produto_codigo: string
          produto_foco_id?: string | null
          produto_nome: string
          quantidade?: number
          valor_total: number
        }
        Update: {
          cliente_nome?: string
          cliente_telefone?: string | null
          created_at?: string | null
          created_by?: string
          data_venda?: string
          id?: string
          observacoes?: string | null
          produto_codigo?: string
          produto_foco_id?: string | null
          produto_nome?: string
          quantidade?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "moda_produto_foco_vendas_produto_foco_id_fkey"
            columns: ["produto_foco_id"]
            isOneToOne: false
            referencedRelation: "moda_produto_foco"
            referencedColumns: ["id"]
          },
        ]
      }
      moda_reservas: {
        Row: {
          cliente_cpf: string
          cliente_nome: string
          cliente_vip: boolean
          consultora_id: string
          created_at: string | null
          created_by: string
          data_expiracao: string
          data_reserva: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          produtos: Json
          status: string
          updated_at: string | null
          venda_id: string | null
        }
        Insert: {
          cliente_cpf: string
          cliente_nome: string
          cliente_vip?: boolean
          consultora_id: string
          created_at?: string | null
          created_by: string
          data_expiracao: string
          data_reserva?: string
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          produtos: Json
          status?: string
          updated_at?: string | null
          venda_id?: string | null
        }
        Update: {
          cliente_cpf?: string
          cliente_nome?: string
          cliente_vip?: boolean
          consultora_id?: string
          created_at?: string | null
          created_by?: string
          data_expiracao?: string
          data_reserva?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          produtos?: Json
          status?: string
          updated_at?: string | null
          venda_id?: string | null
        }
        Relationships: []
      }
      moveis_arquivos: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_featured?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_featured?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moveis_arquivos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "moveis_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      moveis_categorias: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      moveis_descontinuados: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          created_by: string
          descricao: string | null
          favorito: boolean | null
          id: string
          imagem_nome: string | null
          imagem_tamanho: number | null
          imagem_tipo: string | null
          imagem_url: string | null
          nome: string
          percentual_desconto: number | null
          preco: number
          quantidade_estoque: number | null
          updated_at: string
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          created_by: string
          descricao?: string | null
          favorito?: boolean | null
          id?: string
          imagem_nome?: string | null
          imagem_tamanho?: number | null
          imagem_tipo?: string | null
          imagem_url?: string | null
          nome: string
          percentual_desconto?: number | null
          preco: number
          quantidade_estoque?: number | null
          updated_at?: string
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          created_by?: string
          descricao?: string | null
          favorito?: boolean | null
          id?: string
          imagem_nome?: string | null
          imagem_tamanho?: number | null
          imagem_tipo?: string | null
          imagem_url?: string | null
          nome?: string
          percentual_desconto?: number | null
          preco?: number
          quantidade_estoque?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      moveis_folgas: {
        Row: {
          consultor_id: string
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          motivo: string | null
        }
        Insert: {
          consultor_id: string
          created_at?: string | null
          created_by?: string | null
          data: string
          id?: string
          motivo?: string | null
        }
        Update: {
          consultor_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moveis_folgas_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moveis_folgas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moveis_orientacoes: {
        Row: {
          arquivo_nome: string
          arquivo_tipo: string
          arquivo_url: string
          criado_por: string
          data_criacao: string
          descricao: string
          id: string
          tipo: string
          titulo: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_tipo: string
          arquivo_url: string
          criado_por: string
          data_criacao?: string
          descricao: string
          id?: string
          tipo: string
          titulo: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_tipo?: string
          arquivo_url?: string
          criado_por?: string
          data_criacao?: string
          descricao?: string
          id?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      moveis_orientacoes_visualizacoes: {
        Row: {
          created_at: string | null
          id: string
          orientacao_id: string
          user_id: string
          user_role: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          orientacao_id: string
          user_id: string
          user_role: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          orientacao_id?: string
          user_id?: string
          user_role?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moveis_orientacoes_visualizacoes_orientacao_id_fkey"
            columns: ["orientacao_id"]
            isOneToOne: false
            referencedRelation: "moveis_orientacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      moveis_produto_foco: {
        Row: {
          argumentos_venda: string[] | null
          ativo: boolean
          categoria: string
          codigo_produto: string
          created_at: string
          created_by: string
          id: string
          informacoes_adicionais: string | null
          meta_vendas: number | null
          motivo_foco: string | null
          nome_produto: string
          periodo_fim: string
          periodo_inicio: string
          preco_de: number
          preco_por: number
          updated_at: string
        }
        Insert: {
          argumentos_venda?: string[] | null
          ativo?: boolean
          categoria: string
          codigo_produto: string
          created_at?: string
          created_by: string
          id?: string
          informacoes_adicionais?: string | null
          meta_vendas?: number | null
          motivo_foco?: string | null
          nome_produto: string
          periodo_fim: string
          periodo_inicio: string
          preco_de: number
          preco_por: number
          updated_at?: string
        }
        Update: {
          argumentos_venda?: string[] | null
          ativo?: boolean
          categoria?: string
          codigo_produto?: string
          created_at?: string
          created_by?: string
          id?: string
          informacoes_adicionais?: string | null
          meta_vendas?: number | null
          motivo_foco?: string | null
          nome_produto?: string
          periodo_fim?: string
          periodo_inicio?: string
          preco_de?: number
          preco_por?: number
          updated_at?: string
        }
        Relationships: []
      }
      moveis_produto_foco_imagens: {
        Row: {
          created_at: string
          created_by: string
          id: string
          imagem_nome: string
          imagem_tamanho: number | null
          imagem_tipo: string
          imagem_url: string
          ordem: number
          produto_foco_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          imagem_nome: string
          imagem_tamanho?: number | null
          imagem_tipo: string
          imagem_url: string
          ordem?: number
          produto_foco_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          imagem_nome?: string
          imagem_tamanho?: number | null
          imagem_tipo?: string
          imagem_url?: string
          ordem?: number
          produto_foco_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moveis_produto_foco_imagens_produto_foco_id_fkey"
            columns: ["produto_foco_id"]
            isOneToOne: false
            referencedRelation: "moveis_produto_foco"
            referencedColumns: ["id"]
          },
        ]
      }
      moveis_produto_foco_vendas: {
        Row: {
          cliente_nome: string
          cliente_telefone: string | null
          created_at: string
          created_by: string
          data_venda: string
          id: string
          observacoes: string | null
          produto_codigo: string
          produto_foco_id: string
          produto_nome: string
          quantidade: number
          valor_total: number
        }
        Insert: {
          cliente_nome: string
          cliente_telefone?: string | null
          created_at?: string
          created_by: string
          data_venda: string
          id?: string
          observacoes?: string | null
          produto_codigo: string
          produto_foco_id: string
          produto_nome: string
          quantidade?: number
          valor_total: number
        }
        Update: {
          cliente_nome?: string
          cliente_telefone?: string | null
          created_at?: string
          created_by?: string
          data_venda?: string
          id?: string
          observacoes?: string | null
          produto_codigo?: string
          produto_foco_id?: string
          produto_nome?: string
          quantidade?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "moveis_produto_foco_vendas_produto_foco_id_fkey"
            columns: ["produto_foco_id"]
            isOneToOne: false
            referencedRelation: "moveis_produto_foco"
            referencedColumns: ["id"]
          },
        ]
      }
      moveis_rotinas: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          created_by: string
          descricao: string | null
          dia_preferencial: string
          gera_tarefa_automatica: boolean | null
          horario_preferencial: string | null
          id: string
          nome: string
          periodicidade: string
          template_tarefa: Json | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          created_by: string
          descricao?: string | null
          dia_preferencial?: string
          gera_tarefa_automatica?: boolean | null
          horario_preferencial?: string | null
          id?: string
          nome: string
          periodicidade: string
          template_tarefa?: Json | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string
          descricao?: string | null
          dia_preferencial?: string
          gera_tarefa_automatica?: boolean | null
          horario_preferencial?: string | null
          id?: string
          nome?: string
          periodicidade?: string
          template_tarefa?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      moveis_rotinas_conclusoes: {
        Row: {
          concluida: boolean
          created_at: string
          created_by: string
          data_conclusao: string
          id: string
          observacoes: string | null
          rotina_id: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          created_by: string
          data_conclusao: string
          id?: string
          observacoes?: string | null
          rotina_id: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          created_by?: string
          data_conclusao?: string
          id?: string
          observacoes?: string | null
          rotina_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moveis_rotinas_conclusoes_rotina_id_fkey"
            columns: ["rotina_id"]
            isOneToOne: false
            referencedRelation: "moveis_rotinas"
            referencedColumns: ["id"]
          },
        ]
      }
      moveis_tarefas: {
        Row: {
          criado_por: string
          data_atualizacao: string
          data_criacao: string
          data_entrega: string
          descricao: string
          id: string
          orientacao_id: string | null
          origem: string | null
          prioridade: string | null
          rotina_id: string | null
          status: string
          titulo: string
        }
        Insert: {
          criado_por: string
          data_atualizacao?: string
          data_criacao?: string
          data_entrega: string
          descricao: string
          id?: string
          orientacao_id?: string | null
          origem?: string | null
          prioridade?: string | null
          rotina_id?: string | null
          status: string
          titulo: string
        }
        Update: {
          criado_por?: string
          data_atualizacao?: string
          data_criacao?: string
          data_entrega?: string
          descricao?: string
          id?: string
          orientacao_id?: string | null
          origem?: string | null
          prioridade?: string | null
          rotina_id?: string | null
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "moveis_tarefas_orientacao_id_fkey"
            columns: ["orientacao_id"]
            isOneToOne: false
            referencedRelation: "moveis_orientacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_vector_store: {
        Row: {
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      note_folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ocr_logs: {
        Row: {
          confidence: number
          created_at: string | null
          fields_detected: number
          file_name: string
          file_size: number
          id: string
          provider: string
          user_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string | null
          fields_detected: number
          file_name: string
          file_size: number
          id?: string
          provider?: string
          user_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          fields_detected?: number
          file_name?: string
          file_size?: number
          id?: string
          provider?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotional_cards: {
        Row: {
          code: string | null
          created_at: string
          created_by: string
          end_date: string | null
          folder_id: string | null
          id: string
          image_url: string
          position: number
          sector: string
          start_date: string | null
          title: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          folder_id?: string | null
          id?: string
          image_url: string
          position?: number
          sector: string
          start_date?: string | null
          title: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          folder_id?: string | null
          id?: string
          image_url?: string
          position?: number
          sector?: string
          start_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_cards_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "card_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_records: {
        Row: {
          consultant_id: string
          created_at: string | null
          goal_id: string
          id: string
          value: number
        }
        Insert: {
          consultant_id: string
          created_at?: string | null
          goal_id: string
          id?: string
          value: number
        }
        Update: {
          consultant_id?: string
          created_at?: string | null
          goal_id?: string
          id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_records_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_address: string | null
          client_cpf: string | null
          client_name: string | null
          client_phone: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          expected_arrival_date: string | null
          expected_delivery_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          priority: string
          purchase_date: string | null
          status: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_address?: string | null
          client_cpf?: string | null
          client_name?: string | null
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          expected_arrival_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          priority?: string
          purchase_date?: string | null
          status?: string
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_address?: string | null
          client_cpf?: string | null
          client_name?: string | null
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          expected_arrival_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          priority?: string
          purchase_date?: string | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      venda_o_attachments: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          sale_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          sale_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_o_attachments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "venda_o_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_o_sales: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_venda: string
          filial: string
          id: string
          nome_cliente: string
          observacoes: string | null
          previsao_chegada: string | null
          produtos: Json
          status: string
          telefone: string | null
          tipo_entrega: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_venda: string
          filial: string
          id?: string
          nome_cliente: string
          observacoes?: string | null
          previsao_chegada?: string | null
          produtos: Json
          status: string
          telefone?: string | null
          tipo_entrega: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_venda?: string
          filial?: string
          id?: string
          nome_cliente?: string
          observacoes?: string | null
          previsao_chegada?: string | null
          produtos?: Json
          status?: string
          telefone?: string | null
          tipo_entrega?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      agendar_calculo_metas_individuais: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      agendar_calculo_metas_individuais_teste: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_deposit_statistics: {
        Args: { target_user_id: string; target_month: string }
        Returns: undefined
      }
      check_orientacao_completion_by_role: {
        Args: { p_orientacao_id: string; p_target_roles: string[] }
        Returns: {
          role: string
          total_users: number
          viewed_users: number
          completion_percentage: number
          is_complete: boolean
          pending_users: Json
        }[]
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      ensure_user_profile: {
        Args: { user_id: string }
        Returns: Json
      }
      get_featured_directory_files: {
        Args: { limit_count?: number }
        Returns: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          name: string
          updated_at: string
        }[]
      }
      get_metas_dashboard_data: {
        Args: { mes_ref?: string }
        Returns: Json
      }
      get_orientacoes_viewing_stats: {
        Args: { p_target_roles?: string[] }
        Returns: {
          orientacao_id: string
          titulo: string
          tipo: string
          data_criacao: string
          viewing_stats: Json
        }[]
      }
      get_painel_metas_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_manager: {
        Args: { user_id?: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          document_id: string
          source: string
          similarity: number
        }[]
      }
      recalculate_all_deposit_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      register_orientacao_view: {
        Args: { p_orientacao_id: string; p_user_id?: string }
        Returns: Json
      }
      search_directory_files: {
        Args: { search_term: string }
        Returns: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          name: string
          updated_at: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
