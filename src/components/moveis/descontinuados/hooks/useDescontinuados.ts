
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { ProdutoDescontinuado, DescontinuadosFilters } from '@/types/descontinuados';

export function useDescontinuados() {
  const [produtos, setProdutos] = useState<ProdutoDescontinuado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DescontinuadosFilters>({
    categoria: 'all',
    search: '',
    ordenacao: 'mais_recentes'
  });
  const { user } = useAuth();

  const fetchProdutos = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('moveis_descontinuados')
        .select('*');

      // Aplicar filtros
      if (filters.categoria !== 'all') {
        query = query.eq('categoria', filters.categoria);
      }

      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`);
      }

      if (filters.preco_min) {
        query = query.gte('preco', filters.preco_min);
      }

      if (filters.preco_max) {
        query = query.lte('preco', filters.preco_max);
      }

      // Aplicar ordenação
      switch (filters.ordenacao) {
        case 'nome':
          query = query.order('nome');
          break;
        case 'preco_asc':
          query = query.order('preco', { ascending: true });
          break;
        case 'preco_desc':
          query = query.order('preco', { ascending: false });
          break;
        case 'mais_recentes':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion para garantir compatibilidade
      setProdutos((data || []) as ProdutoDescontinuado[]);
    } catch (error) {
      console.error('Erro ao carregar produtos descontinuados:', error);
      toast.error('Erro ao carregar produtos descontinuados');
    } finally {
      setIsLoading(false);
    }
  };

  const createProduto = async (produtoData: any, file?: File) => {
    if (!user) return;

    try {
      let imagem_url = null;
      let imagem_nome = null;
      let imagem_tipo = null;
      let imagem_tamanho = null;

      // Upload da imagem se fornecida
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('moveis-descontinuados')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('moveis-descontinuados')
          .getPublicUrl(fileName);

        imagem_url = publicUrl;
        imagem_nome = file.name;
        imagem_tipo = file.type;
        imagem_tamanho = file.size;
      }

      const { error } = await supabase
        .from('moveis_descontinuados')
        .insert({
          ...produtoData,
          imagem_url,
          imagem_nome,
          imagem_tipo,
          imagem_tamanho,
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Produto descontinuado criado com sucesso!');
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto descontinuado');
    }
  };

  const toggleFavorito = async (produtoId: string, favorito: boolean) => {
    try {
      const { error } = await supabase
        .from('moveis_descontinuados')
        .update({ favorito: !favorito })
        .eq('id', produtoId);

      if (error) throw error;

      setProdutos(prev => 
        prev.map(p => 
          p.id === produtoId ? { ...p, favorito: !favorito } : p
        )
      );

      toast.success(favorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      toast.error('Erro ao atualizar favorito');
    }
  };

  const deleteProduto = async (produtoId: string) => {
    try {
      const { error } = await supabase
        .from('moveis_descontinuados')
        .delete()
        .eq('id', produtoId);

      if (error) throw error;

      toast.success('Produto excluído com sucesso!');
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [filters]);

  return {
    produtos,
    isLoading,
    filters,
    setFilters,
    createProduto,
    toggleFavorito,
    deleteProduto,
    refetch: fetchProdutos
  };
}
