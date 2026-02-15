import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProdutoFocoWithImages } from '@/types/produto-foco';

// Interface para dados do Supabase
interface SupabaseProduto {
  id: string;
  created_at: string;
  ativo: boolean;
  periodo_inicio: string;
  periodo_fim: string;
  [key: string]: unknown;
}

interface SupabaseImagem {
  id: string;
  produto_foco_id: string;
  imagem_url: string;
  imagem_nome: string;
  ordem: number;
  [key: string]: unknown;
}

export function useGenericProdutoFocoData(tableName: string, imageTableName: string) {
  const [produtos, setProdutos] = useState<ProdutoFocoWithImages[]>([]);
  const [produtoAtivo, setProdutoAtivo] = useState<ProdutoFocoWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Buscar produtos
      const { data: produtosData, error: produtosError } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (produtosError) throw produtosError;

      // Buscar todas as imagens de uma vez (otimização N+1)
      const produtosTipados = (produtosData || []) as unknown as SupabaseProduto[];
      const produtoIds = produtosTipados.map(p => p?.id).filter(Boolean);
      
      const imagensMap: Record<string, SupabaseImagem[]> = {};
      
      if (produtoIds.length > 0) {
        const { data: imagensData, error: imagensError } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from(imageTableName as any)
          .select('*')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .in('produto_foco_id', produtoIds as any)
          .order('ordem', { ascending: true });

        if (imagensError) {
          console.error('Erro ao carregar imagens:', imagensError);
        } else {
          // Agrupar imagens por produto
          (imagensData as unknown as SupabaseImagem[] || []).forEach((imagem) => {
            const produtoId = imagem.produto_foco_id;
            if (!imagensMap[produtoId]) imagensMap[produtoId] = [];
            imagensMap[produtoId].push(imagem);
          });
        }
      }

      // Combinar produtos com suas imagens
      const produtosComImagens: ProdutoFocoWithImages[] = produtosTipados.map(produto => ({
        ...produto,
        imagens: imagensMap[produto?.id] || []
      }) as unknown as ProdutoFocoWithImages);

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
  }, [tableName, imageTableName]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos, tableName, imageTableName]);

  return {
    produtos,
    produtoAtivo,
    isLoading,
    fetchProdutos,
    refetch: fetchProdutos
  };
}
