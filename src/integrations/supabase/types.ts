export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assistentes_chatbots: {
        Row: {
          accept_images: boolean | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          accept_images?: boolean | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          accept_images?: boolean | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
      assistentes_conversas: {
        Row: {
          chatbot_id: string
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistentes_conversas_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "assistentes_chatbots"
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
      curriculos: {
        Row: {
          id: string
          candidate_name: string
          job_position: string
          file_url: string
          file_type: string
          file_size: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_name: string
          job_position: string
          file_url: string
          file_type: string
          file_size?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_name?: string
          job_position?: string
          file_url?: string
          file_type?: string
          file_size?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
      crediario_depositos_reset: {
        Row: {
          created_at: string | null
          id: string
          reset_by: string | null
          reset_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reset_by?: string | null
          reset_date?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reset_by?: string | null
          reset_date?: string
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
      frete_items: {
        Row: {
          codigo: string | null
          created_at: string | null
          created_by: string | null
          descricao: string
          frete_id: string
          id: string
          ordem: number | null
          quantidade: number | null
          valor_total_item: number | null
          valor_unitario: number | null
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao: string
          frete_id: string
          id?: string
          ordem?: number | null
          quantidade?: number | null
          valor_total_item?: number | null
          valor_unitario?: number | null
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string
          frete_id?: string
          id?: string
          ordem?: number | null
          quantidade?: number | null
          valor_total_item?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "frete_items_frete_id_fkey"
            columns: ["frete_id"]
            isOneToOne: false
            referencedRelation: "fretes"
            referencedColumns: ["id"]
          },
        ]
      }
      frete_processing_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          extracted_data: Json | null
          frete_id: string | null
          id: string
          image_url: string
          processing_time_ms: number | null
          raw_response: string | null
          success: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          frete_id?: string | null
          id?: string
          image_url: string
          processing_time_ms?: number | null
          raw_response?: string | null
          success?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          frete_id?: string | null
          id?: string
          image_url?: string
          processing_time_ms?: number | null
          raw_response?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "frete_processing_logs_frete_id_fkey"
            columns: ["frete_id"]
            isOneToOne: false
            referencedRelation: "fretes"
            referencedColumns: ["id"]
          },
        ]
      }
      fretes: {
        Row: {
          comprovante_entrega_url: string | null
          cpf_cliente: string | null
          created_at: string | null
          created_by: string | null
          endereco_entrega: string
          id: string
          nome_cliente: string
          nota_fiscal_url: string | null
          pago: boolean | null
          processamento_ia_confidence: number | null
          processamento_ia_log_id: string | null
          status: string | null
          telefone: string
          updated_at: string | null
          valor_frete: number
          valor_total_nota: number | null
        }
        Insert: {
          comprovante_entrega_url?: string | null
          cpf_cliente?: string | null
          created_at?: string | null
          created_by?: string | null
          endereco_entrega: string
          id?: string
          nome_cliente: string
          nota_fiscal_url?: string | null
          pago?: boolean | null
          processamento_ia_confidence?: number | null
          processamento_ia_log_id?: string | null
          status?: string | null
          telefone: string
          updated_at?: string | null
          valor_frete: number
          valor_total_nota?: number | null
        }
        Update: {
          comprovante_entrega_url?: string | null
          cpf_cliente?: string | null
          created_at?: string | null
          created_by?: string | null
          endereco_entrega?: string
          id?: string
          nome_cliente?: string
          nota_fiscal_url?: string | null
          pago?: boolean | null
          processamento_ia_confidence?: number | null
          processamento_ia_log_id?: string | null
          status?: string | null
          telefone?: string
          updated_at?: string | null
          valor_frete?: number
          valor_total_nota?: number | null
        }
        Relationships: []
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
      moda_estoque_contagens: {
        Row: {
          created_at: string
          created_by: string
          id: string
          nome: string
          setor: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          nome: string
          setor?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          nome?: string
          setor?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      moda_estoque_produtos: {
        Row: {
          codigo_produto: string
          contagem_id: string
          created_at: string
          created_by: string
          id: string
          quantidade: number
          setor: string
          updated_at: string
        }
        Insert: {
          codigo_produto: string
          contagem_id: string
          created_at?: string
          created_by: string
          id?: string
          quantidade?: number
          setor: string
          updated_at?: string
        }
        Update: {
          codigo_produto?: string
          contagem_id?: string
          created_at?: string
          created_by?: string
          id?: string
          quantidade?: number
          setor?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moda_estoque_produtos_contagem_id_fkey"
            columns: ["contagem_id"]
            isOneToOne: false
            referencedRelation: "moda_estoque_contagens"
            referencedColumns: ["id"]
          },
        ]
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
      moveis_frete_localidades: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          localidade: string
          observacoes: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          localidade: string
          observacoes?: string | null
          updated_at?: string | null
          valor?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          localidade?: string
          observacoes?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
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
      ssc_procedimentos: {
        Row: {
          canais: Json
          categoria: string
          contatos_exclusivos: Json[] | null
          created_at: string | null
          fabricante: string
          id: string
          links_principais: Json[] | null
          observacoes: string[] | null
          procedimento: string
          updated_at: string | null
        }
        Insert: {
          canais?: Json
          categoria: string
          contatos_exclusivos?: Json[] | null
          created_at?: string | null
          fabricante: string
          id?: string
          links_principais?: Json[] | null
          observacoes?: string[] | null
          procedimento: string
          updated_at?: string | null
        }
        Update: {
          canais?: Json
          categoria?: string
          contatos_exclusivos?: Json[] | null
          created_at?: string | null
          fabricante?: string
          id?: string
          links_principais?: Json[] | null
          observacoes?: string[] | null
          procedimento?: string
          updated_at?: string | null
        }
        Relationships: []
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
      agendar_calculo_metas_individuais: { Args: never; Returns: undefined }
      agendar_calculo_metas_individuais_teste: {
        Args: never
        Returns: undefined
      }
      aplicar_escalas_teste: { Args: never; Returns: number }
      calculate_deposit_statistics: {
        Args: { target_month: string; target_user_id: string }
        Returns: undefined
      }
      calculate_frete_items_total: {
        Args: { frete_uuid: string }
        Returns: number
      }
      can_user_modify_role: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      change_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: Json
      }
      check_orientacao_completion_by_role: {
        Args: { p_orientacao_id: string; p_target_roles: string[] }
        Returns: {
          completion_percentage: number
          is_complete: boolean
          pending_users: Json
          role: string
          total_users: number
          viewed_users: number
        }[]
      }
      check_user_role: {
        Args: { required_role: string; user_id: string }
        Returns: boolean
      }
      delete_user_account: { Args: never; Returns: Json }
      descartar_escalas_teste: { Args: never; Returns: number }
      eh_domingo: { Args: { data_param: string }; Returns: boolean }
      eh_feriado: { Args: { data_param: string }; Returns: boolean }
      eh_sabado: { Args: { data_param: string }; Returns: boolean }
      eh_sexta_feira: { Args: { data_param: string }; Returns: boolean }
      ensure_user_profile: { Args: { user_id: string }; Returns: Json }
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
        SetofOptions: {
          from: "*"
          to: "crediario_directory_files"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_last_depositos_reset: { Args: never; Returns: string }
      get_orientacoes_viewing_stats: {
        Args: { p_target_roles?: string[] }
        Returns: {
          data_criacao: string
          orientacao_id: string
          tipo: string
          titulo: string
          viewing_stats: Json
        }[]
      }
      get_user_role: { Args: { user_id?: string }; Returns: string }
      is_gerente: { Args: { user_id: string }; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_user_manager: { Args: never; Returns: boolean }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
          source: string
        }[]
      }
      obter_escalas_mes: {
        Args: {
          ano_param: number
          mes_param: number
          modo_teste_param?: boolean
        }
        Returns: {
          data: string
          eh_abertura: boolean
          folga_compensatoria_id: string
          funcionario_email: string
          funcionario_id: string
          funcionario_nome: string
          id: string
          modo_teste: boolean
          observacao: string
          tipo: string
        }[]
      }
      obter_sabado_anterior: { Args: { data_param: string }; Returns: string }
      recalculate_all_deposit_statistics: { Args: never; Returns: undefined }
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
        SetofOptions: {
          from: "*"
          to: "crediario_directory_files"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      upsert_moda_estoque_produto: {
        Args: {
          p_codigo_produto: string
          p_contagem_id: string
          p_created_by: string
          p_quantidade: number
          p_setor: string
        }
        Returns: string
      }
      verificar_conflitos_escala: {
        Args: {
          data_fim_param: string
          data_inicio_param: string
          funcionario_id_param: string
          modo_teste_param?: boolean
        }
        Returns: {
          data: string
          mensagem: string
          tipo_conflito: string
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
