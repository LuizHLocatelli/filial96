
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { toast as sonnerToast } from 'sonner';
import { ProdutoFoco } from '@/types/produto-foco';

export function useGenericProdutoFocoCRUD(
  tableName: 'moveis_produto_foco' | 'moda_produto_foco'
) {
  const [items, setItems] = useState<ProdutoFoco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data as ProdutoFoco[]);
    } catch (err) {
      console.error(`Erro ao carregar ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: `Não foi possível carregar os produtos em foco`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tableName, toast]);

  const createProduto = async (dadosProduto: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<ProdutoFoco | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          ...dadosProduto,
          created_by: user.id
        })
        .select()
        .single<ProdutoFoco>();

      if (error) throw error;

      sonnerToast.success('Produto foco criado com sucesso!');
      await fetchItems();
      return data;
    } catch (error) {
      console.error('Erro ao criar produto foco:', error);
      sonnerToast.error('Erro ao criar produto foco');
      return null;
    }
  };

  const updateProduto = async (id: string, dadosProduto: Partial<ProdutoFoco>) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(dadosProduto)
        .eq('id', id);

      if (error) throw error;

      sonnerToast.success('Produto foco atualizado com sucesso!');
      await fetchItems();
    } catch (error) {
      console.error('Erro ao atualizar produto foco:', error);
      sonnerToast.error('Erro ao atualizar produto foco');
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      sonnerToast.success('Produto foco excluído com sucesso!');
      await fetchItems();
    } catch (error) {
      console.error('Erro ao excluir produto foco:', error);
      sonnerToast.error('Erro ao excluir produto foco');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems, tableName]);

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createProduto,
    updateProduto,
    deleteProduto
  };
}
