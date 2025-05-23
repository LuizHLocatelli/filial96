
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useProdutoFocoSales() {
  const { user } = useAuth();

  const registrarVenda = async (dadosVenda: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('moveis_produto_foco_vendas')
        .insert({
          ...dadosVenda,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Venda registrada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error('Erro ao registrar venda');
      return null;
    }
  };

  const getVendasPorProduto = async (produtoId: string) => {
    try {
      const { data, error } = await supabase
        .from('moveis_produto_foco_vendas')
        .select('*')
        .eq('produto_foco_id', produtoId)
        .order('data_venda', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return [];
    }
  };

  return {
    registrarVenda,
    getVendasPorProduto
  };
}
