
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { ProdutoFoco } from '@/types/produto-foco';

export function useGenericProdutoFocoCRUD(tableName: string, refetch: () => Promise<void>) {
  const { user } = useAuth();

  const createProduto = async (dadosProduto: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .insert({
          ...dadosProduto,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Produto foco criado com sucesso!');
      await refetch();
      return data;
    } catch (error) {
      console.error('Erro ao criar produto foco:', error);
      toast.error('Erro ao criar produto foco');
      return null;
    }
  };

  const updateProduto = async (id: string, dadosProduto: Partial<ProdutoFoco>) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .update(dadosProduto)
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto foco atualizado com sucesso!');
      await refetch();
    } catch (error) {
      console.error('Erro ao atualizar produto foco:', error);
      toast.error('Erro ao atualizar produto foco');
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto foco excluído com sucesso!');
      await refetch();
    } catch (error) {
      console.error('Erro ao excluir produto foco:', error);
      toast.error('Erro ao excluir produto foco');
    }
  };

  return {
    createProduto,
    updateProduto,
    deleteProduto
  };
}
