export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          id: string
          task_id: string
          task_title: string
          task_type: string
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          id?: string
          task_id: string
          task_title: string
          task_type: string
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          id?: string
          task_id?: string
          task_title?: string
          task_type?: string
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
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
      crediario_directory_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
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
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
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
          horario_preferencial: string | null
          id: string
          nome: string
          periodicidade: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          created_by: string
          descricao?: string | null
          horario_preferencial?: string | null
          id?: string
          nome: string
          periodicidade: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string
          descricao?: string | null
          horario_preferencial?: string | null
          id?: string
          nome?: string
          periodicidade?: string
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
      notification_read_status: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          read: boolean
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          read?: boolean
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          read?: boolean
          user_id?: string
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
          folder_id: string | null
          id: string
          image_url: string
          position: number
          promotion_date: string | null
          sector: string
          title: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by: string
          folder_id?: string | null
          id?: string
          image_url: string
          position?: number
          promotion_date?: string | null
          sector: string
          title: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string
          folder_id?: string | null
          id?: string
          image_url?: string
          position?: number
          promotion_date?: string | null
          sector?: string
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
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
