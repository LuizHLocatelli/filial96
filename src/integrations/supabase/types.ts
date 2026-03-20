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
      ai_assistant_document_status: {
        Row: {
          assistant_id: string
          created_at: string | null
          error_message: string | null
          file_name: string
          file_url: string
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assistant_id: string
          created_at?: string | null
          error_message?: string | null
          file_name: string
          file_url: string
          id?: string
          status: string
          updated_at?: string | null
        }
        Update: {
          assistant_id?: string
          created_at?: string | null
          error_message?: string | null
          file_name?: string
          file_url?: string
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_document_status_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "ai_assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_documents: {
        Row: {
          assistant_id: string
          chunk_index: number
          content_text: string
          content_tsvector: unknown
          created_at: string
          embedding: string | null
          file_name: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          assistant_id: string
          chunk_index?: number
          content_text?: string
          content_tsvector?: unknown
          created_at?: string
          embedding?: string | null
          file_name: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          assistant_id?: string
          chunk_index?: number
          content_text?: string
          content_tsvector?: unknown
          created_at?: string
          embedding?: string | null
          file_name?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_documents_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "ai_assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistants: {
        Row: {
          avatar_icon: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          system_message: string
          temperature_level: string
          updated_at: string
          user_id: string
          web_search_enabled: boolean
        }
        Insert: {
          avatar_icon?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          system_message: string
          temperature_level?: string
          updated_at?: string
          user_id: string
          web_search_enabled?: boolean
        }
        Update: {
          avatar_icon?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          system_message?: string
          temperature_level?: string
          updated_at?: string
          user_id?: string
          web_search_enabled?: boolean
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          document_urls: string[] | null
          id: string
          image_urls: string[] | null
          role: string
          session_id: string
          tools_used: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          document_urls?: string[] | null
          id?: string
          image_urls?: string[] | null
          role: string
          session_id: string
          tools_used?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          document_urls?: string[] | null
          id?: string
          image_urls?: string[] | null
          role?: string
          session_id?: string
          tools_used?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "ai_assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      aniversariantes_regiao: {
        Row: {
          created_at: string | null
          data_aniversario: string
          filial: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_aniversario: string
          filial: string
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_aniversario?: string
          filial?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
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
          month: string | null
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
          month?: string | null
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
          month?: string | null
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
      company_settings: {
        Row: {
          id: string
          logo_path: string | null
          logo_url: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          logo_path?: string | null
          logo_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          logo_path?: string | null
          logo_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
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
      escala_carga: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          is_carga: boolean
          shift_end: string
          shift_start: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          is_carga?: boolean
          shift_end: string
          shift_start: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          is_carga?: boolean
          shift_end?: string
          shift_start?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escala_carga_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_carga_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          origem?: string | null
          prioridade?: string | null
          rotina_id?: string | null
          status?: string
          titulo?: string
        }
        Relationships: []
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
      orcamentos: {
        Row: {
          cliente_documento: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_nome: string
          cliente_telefone: string | null
          consultor: string | null
          created_at: string | null
          created_by: string | null
          id: string
          itens: Json
          observacoes: string | null
          validade: string
          valor_total: number
        }
        Insert: {
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          consultor?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          itens?: Json
          observacoes?: string | null
          validade?: string
          valor_total?: number
        }
        Update: {
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          consultor?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          itens?: Json
          observacoes?: string | null
          validade?: string
          valor_total?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          lunch_time: string | null
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
          lunch_time?: string | null
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
          lunch_time?: string | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotional_cards: {
        Row: {
          aspect_ratio: string | null
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
          aspect_ratio?: string | null
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
          aspect_ratio?: string | null
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
      role_permissions: {
        Row: {
          allowed_tools: string[]
          id: string
          role: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          allowed_tools?: string[]
          id?: string
          role: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          allowed_tools?: string[]
          id?: string
          role?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      exec_sql: {
        Args: { sql_query: string }
        Returns: {
          row_data: Json
        }[]
      }
      get_last_depositos_reset: { Args: never; Returns: string }
      get_user_role: { Args: { user_id?: string }; Returns: string }
      is_gerente: { Args: { user_id: string }; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_user_manager: { Args: never; Returns: boolean }
      match_assistant_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_assistant_id: string
          query_embedding: string
        }
        Returns: {
          content_text: string
          file_name: string
          id: string
          similarity: number
        }[]
      }
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
