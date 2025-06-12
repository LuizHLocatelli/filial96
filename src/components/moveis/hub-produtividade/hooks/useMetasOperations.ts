
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MetaMensalForm, MetaFocoForm } from '../types/metasTypes';

export function useMetasOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createOrUpdateMetaMensal = async (data: MetaMensalForm, mesAno: string, metaId?: string) => {
    try {
      setIsLoading(true);

      if (metaId) {
        // Atualizar meta existente
        const { error } = await supabase
          .from('metas_mensais')
          .update({
            valor_meta: data.valor_meta,
            descricao: data.descricao,
            updated_at: new Date().toISOString()
          })
          .eq('id', metaId);

        if (error) throw error;
      } else {
        // Criar nova meta
        const { error } = await supabase
          .from('metas_mensais')
          .insert([{
            categoria_id: data.categoria_id,
            mes_ano: mesAno,
            valor_meta: data.valor_meta,
            descricao: data.descricao
          }]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Meta ${metaId ? 'atualizada' : 'criada'} com sucesso!`,
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao salvar meta mensal:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao ${metaId ? 'atualizar' : 'criar'} meta: ${err.message}`,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createMetaFoco = async (data: MetaFocoForm) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('metas_foco')
        .insert([{
          data_foco: data.data_foco,
          categoria_id: data.categoria_id,
          valor_meta: data.valor_meta,
          titulo: data.titulo,
          descricao: data.descricao
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta Foco criada com sucesso!",
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao criar meta foco:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao criar Meta Foco: ${err.message}`,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMetaFoco = async (metaFocoId: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('metas_foco')
        .update({ ativo: false })
        .eq('id', metaFocoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta Foco removida com sucesso!",
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao remover meta foco:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao remover Meta Foco: ${err.message}`,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createOrUpdateMetaMensal,
    createMetaFoco,
    deleteMetaFoco
  };
}
