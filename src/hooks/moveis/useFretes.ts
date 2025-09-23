import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Frete, FreteFormData, FreteItem, UseFreteReturn } from '@/types/frete';
import { parseBrazilianNumber, formatForInput } from '@/utils/numberFormatter';

export function useFretes(): UseFreteReturn {
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar fretes
  const fetchFretes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('fretes')
        .select(`
          *,
          items:frete_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFretes(data || []);
    } catch (err) {
      console.error('Erro ao buscar fretes:', err);
      setError('Erro ao carregar fretes');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os fretes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar fretes na inicialização
  useEffect(() => {
    fetchFretes();
  }, [fetchFretes]);

  // Função para criar frete
  const createFrete = useCallback(async (
    formData: FreteFormData,
    notaFiscalUrl?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar frete principal
      const freteData = {
        cpf_cliente: formData.cpf_cliente || null,
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        endereco_entrega: formData.endereco_entrega,
        valor_total_nota: formData.valor_total_nota ? parseBrazilianNumber(formData.valor_total_nota) : null,
        valor_frete: parseBrazilianNumber(formData.valor_frete),
        pago: formData.pago,
        status: formData.status,
        nota_fiscal_url: notaFiscalUrl || null,
        created_by: userData.user.id,
      };

      const { data: freteCreated, error: freteError } = await supabase
        .from('fretes')
        .insert(freteData)
        .select()
        .single();

      if (freteError) {
        throw freteError;
      }

      // Criar itens se existirem
      if (formData.items && formData.items.length > 0) {
        const itemsData = formData.items.map((item, index) => ({
          frete_id: freteCreated.id,
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: parseBrazilianNumber(item.quantidade) || 1,
          valor_unitario: parseBrazilianNumber(item.valor_unitario) || 0,
          valor_total_item: parseBrazilianNumber(item.valor_total_item) || 0,
          ordem: index,
          created_by: userData.user.id,
        }));

        const { error: itemsError } = await supabase
          .from('frete_items')
          .insert(itemsData);

        if (itemsError) {
          throw itemsError;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Frete criado com sucesso!',
      });

      await fetchFretes();
      return true;
    } catch (err) {
      console.error('Erro ao criar frete:', err);
      setError('Erro ao criar frete');
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o frete',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFretes]);

  // Função para atualizar frete
  const updateFrete = useCallback(async (
    id: string,
    formData: Partial<FreteFormData>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const updateData: any = {};

      if (formData.cpf_cliente !== undefined) {
        updateData.cpf_cliente = formData.cpf_cliente || null;
      }
      if (formData.nome_cliente) updateData.nome_cliente = formData.nome_cliente;
      if (formData.telefone) updateData.telefone = formData.telefone;
      if (formData.endereco_entrega) updateData.endereco_entrega = formData.endereco_entrega;
      if (formData.valor_total_nota !== undefined) {
        updateData.valor_total_nota = formData.valor_total_nota ? parseBrazilianNumber(formData.valor_total_nota) : null;
      }
      if (formData.valor_frete) updateData.valor_frete = parseBrazilianNumber(formData.valor_frete);
      if (formData.pago !== undefined) updateData.pago = formData.pago;
      if (formData.status) updateData.status = formData.status;

      const { error } = await supabase
        .from('fretes')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualizar itens se fornecidos
      if (formData.items) {
        // Deletar itens existentes
        await supabase
          .from('frete_items')
          .delete()
          .eq('frete_id', id);

        // Inserir novos itens
        if (formData.items.length > 0) {
          const { data: userData } = await supabase.auth.getUser();

          const itemsData = formData.items.map((item, index) => ({
            frete_id: id,
            codigo: item.codigo,
            descricao: item.descricao,
            quantidade: parseBrazilianNumber(item.quantidade) || 1,
            valor_unitario: parseBrazilianNumber(item.valor_unitario) || 0,
            valor_total_item: parseBrazilianNumber(item.valor_total_item) || 0,
            ordem: index,
            created_by: userData.user?.id,
          }));

          const { error: itemsError } = await supabase
            .from('frete_items')
            .insert(itemsData);

          if (itemsError) {
            throw itemsError;
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Frete atualizado com sucesso!',
      });

      await fetchFretes();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar frete:', err);
      setError('Erro ao atualizar frete');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o frete',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFretes]);

  // Função para deletar frete
  const deleteFrete = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('fretes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Frete excluído com sucesso!',
      });

      await fetchFretes();
      return true;
    } catch (err) {
      console.error('Erro ao deletar frete:', err);
      setError('Erro ao deletar frete');
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o frete',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFretes]);

  return {
    fretes,
    loading,
    error,
    createFrete,
    updateFrete,
    deleteFrete,
    refreshFretes: fetchFretes,
  };
}