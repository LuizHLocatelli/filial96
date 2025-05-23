
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { ProdutoFoco, ProdutoFocoImagem, ProdutoFocoWithImages } from '../types';

export function useProdutoFoco() {
  const [produtos, setProdutos] = useState<ProdutoFocoWithImages[]>([]);
  const [produtoAtivo, setProdutoAtivo] = useState<ProdutoFocoWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProdutos = async () => {
    try {
      setIsLoading(true);
      
      // Buscar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from('moveis_produto_foco')
        .select('*')
        .order('created_at', { ascending: false });

      if (produtosError) throw produtosError;

      // Buscar imagens para cada produto
      const produtosComImagens: ProdutoFocoWithImages[] = [];
      
      for (const produto of produtosData || []) {
        const { data: imagensData, error: imagensError } = await supabase
          .from('moveis_produto_foco_imagens')
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

  const createProduto = async (dadosProduto: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('moveis_produto_foco')
        .insert({
          ...dadosProduto,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Produto foco criado com sucesso!');
      await fetchProdutos();
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
        .from('moveis_produto_foco')
        .update(dadosProduto)
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto foco atualizado com sucesso!');
      await fetchProdutos();
    } catch (error) {
      console.error('Erro ao atualizar produto foco:', error);
      toast.error('Erro ao atualizar produto foco');
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('moveis_produto_foco')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto foco excluído com sucesso!');
      await fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto foco:', error);
      toast.error('Erro ao excluir produto foco');
    }
  };

  const uploadImagem = async (produtoId: string, file: File, ordem: number = 0) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${produtoId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('moveis-produto-foco')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('moveis-produto-foco')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('moveis_produto_foco_imagens')
        .insert({
          produto_foco_id: produtoId,
          imagem_url: publicUrl,
          imagem_nome: file.name,
          imagem_tipo: file.type,
          imagem_tamanho: file.size,
          ordem,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProdutos();
      return data;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  const deleteImagem = async (imagemId: string, imagemUrl: string) => {
    try {
      // Extrair o path da URL
      const urlParts = imagemUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // produtoId/arquivo.ext

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('moveis-produto-foco')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error } = await supabase
        .from('moveis_produto_foco_imagens')
        .delete()
        .eq('id', imagemId);

      if (error) throw error;

      toast.success('Imagem excluída com sucesso!');
      await fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      toast.error('Erro ao excluir imagem');
    }
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
    refetch: fetchProdutos
  };
}
