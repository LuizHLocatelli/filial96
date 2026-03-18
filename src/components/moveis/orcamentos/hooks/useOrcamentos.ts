import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { OrcamentoItem, ClienteOrcamento } from "../types";
import type { Json } from "@/integrations/supabase/types";

export interface Orcamento {
  id: string;
  cliente_nome: string;
  cliente_documento: string | null;
  cliente_telefone: string | null;
  cliente_email: string | null;
  cliente_endereco: string | null;
  itens: OrcamentoItem[];
  validade: string;
  observacoes: string | null;
  consultor: string | null;
  valor_total: number;
  created_at: string | null;
  created_by: string | null;
}

export interface CreateOrcamentoInput {
  cliente: ClienteOrcamento;
  itens: OrcamentoItem[];
  validade: string;
  observacoes: string;
  consultor?: string;
  valor_total: number;
}

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrcamentos = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedOrcamentos: Orcamento[] = (data || []).map(orcamento => ({
        id: orcamento.id,
        cliente_nome: orcamento.cliente_nome || '',
        cliente_documento: orcamento.cliente_documento || null,
        cliente_telefone: orcamento.cliente_telefone || null,
        cliente_email: orcamento.cliente_email || null,
        cliente_endereco: orcamento.cliente_endereco || null,
        itens: (orcamento.itens as unknown as OrcamentoItem[]) || [],
        validade: orcamento.validade || '7 dias',
        observacoes: orcamento.observacoes || null,
        consultor: orcamento.consultor || null,
        valor_total: orcamento.valor_total || 0,
        created_at: orcamento.created_at || null,
        created_by: orcamento.created_by || null,
      }));

      setOrcamentos(typedOrcamentos);
    } catch (error) {
      console.error('Error fetching orcamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrcamento = async (input: CreateOrcamentoInput): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('orcamentos')
        .insert({
          cliente_nome: input.cliente.nome,
          cliente_documento: input.cliente.documento,
          cliente_telefone: input.cliente.telefone,
          cliente_email: input.cliente.email,
          cliente_endereco: input.cliente.endereco,
          itens: input.itens as unknown as Json,
          validade: input.validade,
          observacoes: input.observacoes,
          consultor: input.consultor,
          valor_total: input.valor_total,
          created_by: user?.id,
        })
        .select('id')
        .single();

      if (error) throw error;

      fetchOrcamentos();
      return data.id;
    } catch (error) {
      console.error('Error creating orcamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o orçamento",
        variant: "destructive",
        duration: 5000,
      });
      return null;
    }
  };

  const deleteOrcamento = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso!",
        duration: 3000,
      });

      fetchOrcamentos();
      return true;
    } catch (error) {
      console.error('Error deleting orcamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento",
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrcamentos();

    const channel = supabase
      .channel('orcamentos-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orcamentos',
      }, () => {
        fetchOrcamentos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrcamentos]);

  return { orcamentos, isLoading, refetch: fetchOrcamentos, createOrcamento, deleteOrcamento };
}
