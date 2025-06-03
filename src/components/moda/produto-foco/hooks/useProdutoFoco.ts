import { useState, useEffect } from 'react';
import { ProdutoFocoWithImages, ProdutoFoco } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProdutoFoco() {
  const [produtos, setProdutos] = useState<ProdutoFocoWithImages[]>([]);
  const [produtoAtivo, setProdutoAtivo] = useState<ProdutoFocoWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = async () => {
    try {
      setIsLoading(true);
      
      // Buscar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from('moda_produto_foco')
        .select('*')
        .order('created_at', { ascending: false });

      if (produtosError) throw produtosError;

      // Para simplificar, vamos apenas adicionar um array vazio de imagens
      const produtosComImagens: ProdutoFocoWithImages[] = (produtosData || []).map(produto => ({
        ...produto,
        imagens: []
      }));

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

  const createProduto = async (dados: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('moda_produto_foco')
        .insert([dados])
        .select('*')
        .single();

      if (error) throw error;

      await fetchProdutos();
      toast.success('Produto foco criado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
      return false;
    }
  };

  const updateProduto = async (id: string, dados: Partial<ProdutoFoco>) => {
    try {
      const { error } = await supabase
        .from('moda_produto_foco')
        .update(dados)
        .eq('id', id);

      if (error) throw error;

      await fetchProdutos();
      toast.success('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('moda_produto_foco')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      await fetchProdutos();
      toast.success('Produto removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro ao remover produto');
    }
  };

  // Funções placeholder para manter compatibilidade
  const uploadImagem = async (file: File) => {
    // Implementar futuramente
    console.log('Upload de imagem não implementado ainda');
  };

  const deleteImagem = async (imagemId: string, imagemUrl: string) => {
    // Implementar futuramente
    console.log('Exclusão de imagem não implementada ainda');
  };

  const registrarVenda = async (dadosVenda: any) => {
    // Implementar futuramente
    console.log('Registro de venda não implementado ainda');
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return {
    produtos,
    produtoAtivo,
    isLoading,
    createProduto,
    updateProduto,
    deleteProduto,
    uploadImagem,
    deleteImagem,
    registrarVenda,
    refetch: fetchProdutos
  };
} 