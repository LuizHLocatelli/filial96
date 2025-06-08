import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProdutoFocoWithImages } from '@/types/produto-foco';

export function useGenericProdutoFocoData(tableName: string, imageTableName: string) {
  const [produtos, setProdutos] = useState<ProdutoFocoWithImages[]>([]);
  const [produtoAtivo, setProdutoAtivo] = useState<ProdutoFocoWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = async () => {
    try {
      setIsLoading(true);
      
      // Buscar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (produtosError) throw produtosError;

      // Buscar imagens para cada produto
      const produtosComImagens: ProdutoFocoWithImages[] = [];
      
      for (const produto of produtosData || []) {
        const { data: imagensData, error: imagensError } = await supabase
          .from(imageTableName)
          .select('*')
          .eq('produto_foco_id', produto.id)
          .order('ordem', { ascending: true });

        if (imagensError) {
          console.error('Erro ao carregar imagens:', imagensError);
        }

        produtosComImagens.push({
          ...produto,
          imagens: imagensData || []
        });
      }

      setProdutos(produtosComImagens);
      
      // Definir produto ativo (o primeiro ativo encontrado)
      const ativo = produtosComImagens.find(p => p.ativo && 
        new Date(p.periodo_inicio) <= new Date() && 
        new Date(p.periodo_fim) >= new Date()
      );
      setProdutoAtivo(ativo || null);

    } catch (error) {
      console.error('Erro ao carregar produtos foco:', error);
      toast.error('Erro ao carregar produtos foco');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [tableName, imageTableName]);

  return {
    produtos,
    produtoAtivo,
    isLoading,
    fetchProdutos,
    refetch: fetchProdutos
  };
} 